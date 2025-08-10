import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MultiSelectComponent } from "../../../common/components/multi-select/multi-select.component";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatGridListModule } from "@angular/material/grid-list";
import { FlexLayoutModule } from "@ngbracket/ngx-layout";
import { AgGridModule, AgGridAngular } from "ag-grid-angular";
import { GridOptions, GridApi, ColDef } from "ag-grid-community";
import { MatTabsModule } from "@angular/material/tabs";
import { DDLService } from "@services/ddl.service";
import { ReportService } from "@services/report.services";
import { forkJoin } from "rxjs";
import { format } from "date-fns";
import { formatAmount } from "../../../common/utils/numberformate";
import { idsStringArr } from '../../../common/utils/common-funs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

@Component({
  selector: "app-live-bill-summary-report",
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatDatepickerModule,
    MatSelectModule,
    MatIconModule,
    MatCheckboxModule,
    CommonModule,
    MatButtonModule,
    MatGridListModule,
    FlexLayoutModule,
    MatTabsModule,
    MultiSelectComponent,
    AgGridModule,
    AgGridAngular
  ],
  templateUrl: "./live-bill-summary.component.html",
  styleUrls: ["./live-bill-summary.component.scss"],
})

export class LiveBillSummaryComponent implements OnInit, OnDestroy {
  form: FormGroup;
  branchDDLList: any;
  exchangeDDLList: any;
  accountDDLList: any;
  gridAPI: GridApi;
  detailGridApi: GridApi;
  summaryGridApi: GridApi;
  missingRateGridApi: GridApi;
  selectedTabIndex = 1;
  detailDataList: any[] = [];
  summaryDataList: any[] = [];
  summaryTotals: any[] = [];
  missingRateDataList: any[] = [];
  autoUpdateInterval: any;
  autoUpdateEnabled = false;
  detailNumericFields = ['openQty','openRate','buyQty','buyRate','sellQty','sellRate','closeQty','ltp','grossMTM','brokAmt','netAmt'];
  summaryNumericFields = ['grossMTM','brokAmt','shareAmt','netAmt'];

  detailColumnDefs: ColDef[] = [

    { headerName: 'Name', field: 'name' },
    { headerName: 'Contract', field: 'contract' },
    { headerName: 'OpenQty', field: 'openQty', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this) },
    { headerName: 'OpenRate', field: 'openRate', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this) },
    { headerName: 'BuyQty', field: 'buyQty', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this) },
    { headerName: 'BuyRate', field: 'buyRate', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this) },
    { headerName: 'SellQty', field: 'sellQty', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this) },
    { headerName: 'SellRate', field: 'sellRate', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this) },
    { headerName: 'CloseQty', field: 'closeQty', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this) },
    { headerName: 'LTP', field: 'ltp', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this) },
    { headerName: 'GrossMTM', field: 'grossMTM', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this) },
    { headerName: 'BrokAmt', field: 'brokAmt', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this) },
    { headerName: 'NetAmt', field: 'netAmt', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this) }
  ];

  summaryColumnDefs: ColDef[] = [
    { headerName: 'Name', field: 'name' },
    {
      headerName: 'GrossMTM',
      field: 'grossMTM',
      type: 'rightAligned',
      cellRenderer: this.numberWithArrowRenderer.bind(this)
    },
    {
      headerName: 'BrokAmt',
      field: 'brokAmt',
      type: 'rightAligned',
      cellRenderer: this.numberWithArrowRenderer.bind(this)
    },
    {
      headerName: 'ShreeAmt',
      field: 'shareAmt',
      type: 'rightAligned',
      cellRenderer: this.numberWithArrowRenderer.bind(this)
    },
    {
      headerName: 'NetAmt',
      field: 'netAmt',
      type: 'rightAligned',
      cellRenderer: this.numberWithArrowRenderer.bind(this)
    }
  ];

  missingRateColumnDefs: ColDef[] = [
    { headerName: 'Contract', field: 'contract' },
    { headerName: 'OpenRate', field: 'openRate', type: 'rightAligned', valueFormatter: formatAmount },
    { headerName: 'LTP', field: 'ltp', type: 'rightAligned', valueFormatter: formatAmount }
  ];
  agGridOptions: GridOptions & { enableCellChangeFlash?: boolean } = {
    defaultColDef: {
      resizable: true,
      filter: true,
      sortable: true,
      flex: 1,
      minWidth: 100,
    },
    enableCellTextSelection: true,
    suppressRowHoverHighlight: true,
    enableCellChangeFlash: true,
    animateRows: true,
    getRowId: (params) => params.data?.saudaId || params.data?.accId || params.data?.contract,
    onGridReady: (params) => {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      }, 100);
    },
  };

  constructor(
    private formBuilder: FormBuilder,
    private ddlService: DDLService,
    private cdr: ChangeDetectorRef,
    private reportService: ReportService
  ) { }


  initalizeForm() {
    const currentDate = new Date();
    this.form = this.formBuilder.group({
      fromDate: [currentDate, Validators.required],
      toDate: [currentDate, Validators.required],
      exId: ['', Validators.required],
      branchIds: ['', Validators.required],
      account: ['', Validators.required]
    });
  }
  
  ngOnInit() {
    this.initalizeForm();
    this.initalApiCalls();
  }

  ngOnDestroy() {
    this.stopAutoUpdate();
  }


  initalApiCalls() {
    forkJoin([
      this.ddlService.getBranchDDL(),
      this.ddlService.getExchangeNameDLL(),
      this.ddlService.getAccountDDL(),
    ]).subscribe({
      next: ([branchRes, exchangeRes, accountRes]) => {
        this.branchDDLList = branchRes.data;
        this.exchangeDDLList = exchangeRes.data;
        this.accountDDLList = accountRes.data;
        this.cdr.detectChanges();
        if (this.form?.valid) {
          this.onSubmit(this.form.value);
        }
      },
    });
  }

  onSubmit(event: any) {
    const body = { ...event };
    body.fromDate = format(body.fromDate, 'yyyy-MM-dd') + 'T00:00:00';
    body.toDate = format(body.toDate, 'yyyy-MM-dd') + 'T00:00:00';
    body.viewType = this.selectedTabIndex === 1 ? 'Summary' : this.selectedTabIndex === 0 ? 'Detail' : 'MissingRate';
    body.exId = idsStringArr(body.exId);
    body.account = idsStringArr(body.account);
    body.branchIds = idsStringArr(body.branchIds);
    body.updateData = false;
    this.reportService.getBillSummary(body).subscribe({
      next: (res) => {
        if (body.viewType === 'Summary') {
          this.summaryDataList = res;
          setTimeout(() => this.updateSummaryTotals());
        } else if (body.viewType === 'Detail') {
          this.detailDataList = res;
        } else {
          this.missingRateDataList = res;
        }
        if (this.autoUpdateEnabled) {
          this.startAutoUpdate();
        }
      },
    });
  }

  onUpdateData() {
    this.fetchUpdatedData();
  }

  onFilteredChanged() {
    const filterTextBox = document.getElementById('filter-text-box');
    if (filterTextBox) {
      const inputElement = filterTextBox as HTMLInputElement;
      const text = inputElement.value;
      this.detailGridApi?.setGridOption('quickFilterText', text);
      this.summaryGridApi?.setGridOption('quickFilterText', text);
      this.missingRateGridApi?.setGridOption('quickFilterText', text);
      this.updateSummaryTotals();
    }
  }

  onDetailGridReady(params: any) {
    this.detailGridApi = params.api;
    setTimeout(() => {
      this.detailGridApi.sizeColumnsToFit();
    }, 100);
  }

  onSummaryGridReady(params: any) {
    this.summaryGridApi = params.api;
    setTimeout(() => {
      this.summaryGridApi.sizeColumnsToFit();
      this.updateSummaryTotals();
    }, 100);
  }

  onMissingRateGridReady(params: any) {
    this.missingRateGridApi = params.api;
    setTimeout(() => {
      this.missingRateGridApi.sizeColumnsToFit();
    }, 100);
  }

  onTabChange(index: number) {
    this.selectedTabIndex = index;
    if (this.form?.valid) {
      this.onSubmit(this.form.value);
    }
  }

  getCurrentGridApi(): GridApi | undefined {
    if (this.selectedTabIndex === 0) return this.detailGridApi;
    if (this.selectedTabIndex === 1) return this.summaryGridApi;
    return this.missingRateGridApi;
  }

  onBtnExportCsv(): void {
    const api = this.getCurrentGridApi();
    api?.exportDataAsCsv({ fileName: 'live-bill-summary' });
  }

  downloadAsPDF() {
    const api = this.getCurrentGridApi();
    if (!api) { return; }

    let columnKeys: string[] = [];
    if (this.selectedTabIndex === 0) {
      columnKeys = [
        'name', 'contract', 'openQty', 'openRate', 'buyQty', 'buyRate',
        'sellQty', 'sellRate', 'closeQty', 'ltp', 'grossMTM', 'brokAmt', 'netAmt'
      ];
    } else if (this.selectedTabIndex === 1) {
      columnKeys = ['name', 'grossMTM', 'brokAmt', 'shareAmt', 'netAmt'];
    } else {
      columnKeys = ['contract', 'openRate', 'ltp'];
    }

    const csvData = api.getDataAsCsv({
      columnKeys,
      suppressQuotes: false,
      skipColumnHeaders: true,
    });

    const parsedData = Papa.parse(csvData as string, {
      header: false,
      skipEmptyLines: true,
    });
    const dataRows = parsedData.data.slice(1);
    const doc = new jsPDF('l', 'pt', 'a4');

    const mainHeader = 'Live Bill Summary';

    const addHeader = (doc: any, pageNumber: any) => {
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const xOffset = pageWidth / 2 - doc.getTextWidth(mainHeader) / 2;
      doc.text(mainHeader, xOffset, 20);

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.setLineCap(2);
      doc.line(40, 30, pageWidth - 40, 30);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.setLineCap(2);
      doc.line(40, 60, pageWidth - 40, 60);
    };

    const totalPagesExp = '{total_pages_count_string}';

    addHeader(doc, 1);

    autoTable(doc, {
      head: [columnKeys],
      body: dataRows as string[][],
      startY: 70,
      theme: 'grid',
      headStyles: { fillColor: [40, 53, 147] },
      didDrawPage: (data) => {
        addHeader(doc, data.pageNumber);

        if (data.pageNumber >= 1) {
          data.settings.margin.top = 70;
        }

        const tableWidth = doc.internal.pageSize.getWidth();
        const tableStartX = data.settings.margin.left;
        const tableStartY = data.settings.startY;
        const tableHeight = (data?.cursor?.y || 0) - tableStartY;

        const footerText = `Page ${data.pageNumber} of ${totalPagesExp}`;
        const xOffset = 40;
        doc.text(footerText, xOffset, doc.internal.pageSize.height - 20);

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1);
        doc.rect(tableStartX, tableStartY, tableWidth - 80, tableHeight);
      },
    });

    if (typeof (doc as any).putTotalPages === 'function') {
      (doc as any).putTotalPages(totalPagesExp);
    }

    doc.save('LiveBillSummary.pdf');
  }

  onAutoUpdateChange() {
    if (this.autoUpdateEnabled) {
      this.startAutoUpdate();
    } else {
      this.stopAutoUpdate();
    }
  }

  startAutoUpdate() {
    if (!this.autoUpdateEnabled) {
      return;
    }
    this.stopAutoUpdate();
    this.autoUpdateInterval = setInterval(() => {
      this.fetchUpdatedData();
    }, 1000);
  }

  stopAutoUpdate() {
    if (this.autoUpdateInterval) {
      clearInterval(this.autoUpdateInterval);
      this.autoUpdateInterval = null;
    }
  }

  fetchUpdatedData() {
    const body = { ...this.form.value };
    body.fromDate = format(body.fromDate, 'yyyy-MM-dd') + 'T00:00:00';
    body.toDate = format(body.toDate, 'yyyy-MM-dd') + 'T00:00:00';
    body.viewType = this.selectedTabIndex === 1 ? 'Summary' : this.selectedTabIndex === 0 ? 'Detail' : 'MissingRate';
    body.exId = idsStringArr(body.exId);
    body.account = idsStringArr(body.account);
    body.branchIds = idsStringArr(body.branchIds);
    body.updateData = true;
    this.reportService.getBillSummary(body).subscribe({
      next: (res) => {
        if (body.viewType === 'Summary') {
          this.summaryDataList = this.applyDiffs(this.summaryDataList, res, this.summaryNumericFields);
          setTimeout(() => this.updateSummaryTotals());
        } else if (body.viewType === 'Detail') {
          this.detailDataList = this.applyDiffs(this.detailDataList, res, this.detailNumericFields);
        }
        this.cdr.detectChanges();
      }
    });
  }

  applyDiffs(oldList: any[], newList: any[], fields: string[]): any[] {
    const oldMap: any = {};
    oldList.forEach(item => {
      const id = item.saudaId || item.accId || item.contract;
      if (id) oldMap[id] = item;
    });
    return newList.map((row: any) => {
      const id = row.saudaId || row.accId || row.contract;
      const oldRow = oldMap[id] || {};
      row.__diffs = {};
      fields.forEach(field => {
        const oldVal = parseFloat(oldRow[field]) || 0;
        const newVal = parseFloat(row[field]) || 0;
        if (oldRow && oldVal !== newVal) {
          row.__diffs[field] = newVal > oldVal ? 'up' : 'down';
        }
      });
      return row;
    });
  }

  parseNumber(val: any): number {
    if (val === null || val === undefined) {
      return 0;
    }
    let str = String(val);
    const isNegative = str.includes('(') && str.includes(')');
    str = str.replace(/[()]/g, '');
    const cleaned = str.replace(/[^0-9.-]/g, '');
    let num = parseFloat(cleaned);
    if (isNaN(num)) {
      num = 0;
    }
    return isNegative ? -num : num;
  }

  numberWithArrowRenderer(params: any): string {
    const raw = params.value;
    const value = this.parseNumber(raw);
    if (isNaN(value)) {
      return '';
    }
    if (params.node?.rowPinned) {
      const currencyFields = ['grossMTM', 'brokAmt', 'netAmt', 'shareAmt'];
      const formatted = currencyFields.includes(params.colDef.field || '')
        ? this.safeFormatCurrency(value)
        : formatAmount(value);
      let colorClass = 'neutral';
      if (value > 0) colorClass = 'up';
      else if (value < 0) colorClass = 'down';
      return `<span class="total-value ${colorClass}">${formatted}</span>`;
    }
    const field = params.colDef.field || '';
    const diff = params.data?.__diffs?.[field];
    const blinkClass = diff === 'up' ? 'blink-up' : diff === 'down' ? 'blink-down' : '';
    const currencyFields = ['grossMTM', 'brokAmt', 'netAmt', 'shareAmt'];
    const formatted = currencyFields.includes(field)
      ? this.safeFormatCurrency(value)
      : formatAmount(value);

    if (field === 'openRate') {
      return `<span class="${blinkClass}">${formatted}</span>`;
    }

    let arrowClass = 'neutral';
    let arrowSymbol = '';
    if (value > 0) {
      arrowClass = 'up';
      arrowSymbol = '▲';
    } else if (value < 0) {
      arrowClass = 'down';
      arrowSymbol = '▼';
    }
    return `<span class="arrow-icon ${arrowClass} ${blinkClass}">${arrowSymbol} ${formatted}</span>`;
  }

  safeFormatCurrency(value: any): string {
    const num = parseFloat(value);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  normalizeKey(key: string): string {
    return key.replace(/[^a-z0-9]/gi, '').toLowerCase();
  }

  getFieldValue(row: any, fieldName: string): any {
    if (!row) return null;
    const synonyms: any = {
      grossMTM: ['grossmtm'],
      brokAmt: ['brokamt'],
      shareAmt: ['shareamt', 'shreeamt'],
      netAmt: ['netamt', 'netamtis'],
    };
    const names = [fieldName, ...(synonyms[fieldName] || [])];
    const target = names.map((n) => this.normalizeKey(n));
    for (const key of Object.keys(row)) {
      if (target.includes(this.normalizeKey(key))) {
        return row[key];
      }
    }
    return null;
  }

  computeSummaryTotals() {
    const totals = {
      name: 'Total',
      grossMTM: 0,
      brokAmt: 0,
      shareAmt: 0,
      netAmt: 0,
    } as any;

    const addRow = (row: any) => {
      totals.grossMTM += this.parseNumber(this.getFieldValue(row, 'grossMTM'));
      totals.brokAmt += this.parseNumber(this.getFieldValue(row, 'brokAmt'));
      totals.shareAmt += this.parseNumber(this.getFieldValue(row, 'shareAmt'));
      totals.netAmt += this.parseNumber(this.getFieldValue(row, 'netAmt'));
    };

    if (this.summaryGridApi) {
      const rowCount = this.summaryGridApi.getDisplayedRowCount();
      for (let i = 0; i < rowCount; i++) {
        const node = this.summaryGridApi.getDisplayedRowAtIndex(i);
        if (node && !node.rowPinned) {
          addRow(node.data || {});
        }
      }
    } else {
      this.summaryDataList.forEach(addRow);
    }

    return totals;
  }

  updateSummaryTotals() {
    const totals = this.computeSummaryTotals();
    this.summaryTotals = [totals];
    if (this.summaryGridApi) {
      // setPinnedBottomRowData is not part of older GridApi typings
      (this.summaryGridApi as any).setPinnedBottomRowData?.(this.summaryTotals);
      this.summaryGridApi.refreshCells({ force: true });
    }
    this.cdr.detectChanges();
  }

}
