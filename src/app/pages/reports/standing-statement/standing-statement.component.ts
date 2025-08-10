import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import { GridApi, GridOptions, ColDef } from 'ag-grid-community';
import { forkJoin } from 'rxjs';
import { DDLService } from '@services/ddl.service';
import { ReportService } from '@services/report.services';
import { MultiSelectComponent } from '../../../common/components/multi-select/multi-select.component';
import { idsStringArr } from '../../../common/utils/common-funs';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

@Component({
  selector: "app-standing-statement-report",
  templateUrl: "./standing-statement.component.html",
  styleUrls: ["./standing-statement.component.scss"],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    FlexLayoutModule,
    MultiSelectComponent,
    AgGridModule,
    AgGridAngular,
  ],
})

export class StandingStatementComponent implements OnInit {
  form: FormGroup;
  gridAPI?: GridApi<any>;
  exchangeDDLList: any[] = [];
  branchDDLList: any[] = [];
  accountDDLList: any[] = [];

  @ViewChild('advancedFilterDialog')
  advancedFilterDialog!: TemplateRef<any>;
  private dialogRef?: MatDialogRef<any>;

  groupColSpan = (params: any): number => {
    if (params.data?.isGroupHeader) {
      const colApi = params.columnApi;
      if (colApi) {
        return colApi.getAllDisplayedColumns().length;
      }
      return this.columnDefs.length;
    }
    return 1;
  };


  partyWiseColumnDefs: ColDef[] = [
    {
      headerName: 'SAUDA',
      field: 'sauda',
      colSpan: this.groupColSpan,
    },
    { headerName: 'Lots', field: 'calval', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this) },
    { headerName: 'Ref Lot', field: 'reflot', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this) },
    { headerName: 'Buy', field: 'bqnty', type: 'rightAligned', cellRenderer: this.qtyRenderer.bind(this), cellClass: 'buy-column' },
    { headerName: 'Sell', field: 'sqnty', type: 'rightAligned', cellRenderer: this.qtyRenderer.bind(this), cellClass: 'sell-column' },
    {
      headerName: 'NetQty',
      field: 'netQty',
      type: 'rightAligned',
      cellRenderer: this.qtyRenderer.bind(this),
      cellClass: (params) =>
        this.parseNumber(params.value) < 0 ? 'loss-value' : 'profit-value',
    },
    { headerName: 'Settle Rate', field: 'setrate', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this) },
    { headerName: 'Prev. Rate', field: 'prvrate', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this) },
    {
      headerName: 'NetChange',
      field: 'netChange',
      type: 'rightAligned',
      cellRenderer: this.numberWithArrowRenderer.bind(this),
      cellClass: params =>
        this.parseNumber(params.value) < 0 ? 'loss-value' : 'profit-value',
    },
    {
      headerName: 'MTM',
      field: 'mtm',
      type: 'rightAligned',
      cellRenderer: this.numberWithArrowRenderer.bind(this),
      cellClass: params =>
        this.parseNumber(params.value) < 0 ? 'loss-value' : 'profit-value',
    },
    {
      headerName: 'NetValue',
      field: 'netBal',
      type: 'rightAligned',
      cellRenderer: this.numberWithArrowRenderer.bind(this),
      cellClass: params =>
        this.parseNumber(params.value) < 0 ? 'loss-value' : 'profit-value',
    },
  ];


  saudaWiseColumnDefs: ColDef[] = [
    { headerName: 'Sell Code', field: 'scode' },
    { headerName: 'Sell Party', field: 'sparty' },
    {
      headerName: 'Sell Qty',
      field: 'sqnty',
      type: 'numericColumn',
      enableValue: false,
      cellClass: 'sell-column',
      cellRenderer: this.qtyRenderer.bind(this),
    },
    { headerName: 'Buy Code', field: 'bcode' },
    { headerName: 'Buy Party', field: 'bparty' },
    {
      headerName: 'Buy Qty',
      field: 'bqnty',
      type: 'numericColumn',
      enableValue: false,
      cellClass: 'buy-column',
      cellRenderer: this.qtyRenderer.bind(this),
    },
    {
      headerName: 'NetQty',
      field: 'netQty',
      type: 'rightAligned',
      cellRenderer: this.qtyRenderer.bind(this),
      cellClass: (params) =>
        this.parseNumber(params.value) < 0 ? 'loss-value' : 'profit-value',
    }
  ];


  //saudaWiseColumnDefs: ColDef[] = [
  //  {
  //    headerName: 'BParty',
  //    field: 'bparty',
  //    colSpan: this.groupColSpan,
  //  },
  //  { headerName: 'Lots', field: 'calval', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this) },
  //  { headerName: 'Buy', field: 'bqnty', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this), cellClass: 'buy-column' },
  //  { headerName: 'Sell', field: 'sqnty', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this), cellClass: 'sell-column' },
  //  { headerName: 'Settle Rate', field: 'serrate', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this) },
  //  { headerName: 'Prev. Rate', field: 'prvrate', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this) },
  //  { headerName: 'Mtm', field: 'Mtm', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this) },
  //  { headerName: 'NetValue', field: 'netBal', type: 'rightAligned', cellRenderer: this.numberWithArrowRenderer.bind(this) },
  //];

  summaryColumnDefs: ColDef[] = [
    { headerName: 'Party', field: 'bparty' },
    {
      headerName: 'Ledger Bal',
      field: 'closeBal',
      type: 'rightAligned',
      cellRenderer: this.numberWithArrowRenderer.bind(this),
      cellClass: params =>
        this.parseNumber(params.value) < 0 ? 'loss-value' : 'profit-value',
    },
    {
      headerName: 'NetValue',
      field: 'netBal',
      type: 'rightAligned',
      cellRenderer: this.numberWithArrowRenderer.bind(this),
      cellClass: params =>
        this.parseNumber(params.value) < 0 ? 'loss-value' : 'profit-value',
    },
    {
      headerName: 'Net P/L',
      field: 'netPL',
      type: 'rightAligned',
      cellRenderer: this.numberWithArrowRenderer.bind(this),
      cellClass: params =>
        this.parseNumber(params.value) < 0 ? 'loss-value' : 'profit-value',
    },
  ];

  columnDefs: ColDef[] = [...this.partyWiseColumnDefs];

  gridDataList: any[] = [];

  agGridOptions: GridOptions = {
    defaultColDef: {
      filter: true,
      sortable: true,
      resizable: true,
    },
    enableCellTextSelection: true,
    overlayLoadingTemplate:
      '<div class="custom-ag-loader"><div class="loader"></div><span>Loading...</span></div>',
    overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">No rows to show</span>',
    suppressRowHoverHighlight: true,
    getRowClass: this.getRowClass.bind(this),
  };

  constructor(
    private fb: FormBuilder,
    private ddlService: DDLService,
    private reportService: ReportService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const currentDate = new Date();
    this.form = this.fb.group({
      uptoDate: [currentDate],
      exchange: [],
      branch: [],
      account: [],
      option: ['PartyWise'],
      approvalStatus: ['All Items'],
      avgOption: ['withoutAvg'],
      margin: false,
      brokerWise: false,
      settlementWise: false,
      withSharing: false,
      withAgeing: false,
      withLedgerBal: false,
    });
    this.loadDropdowns();
    //this.form.get('option')?.valueChanges.subscribe(() => {
    //  this.updateColumnDefs();
    //});
    //this.updateColumnDefs();
  }

  openAdvancedFilter() {
    this.dialogRef = this.dialog.open(this.advancedFilterDialog);
  }

  applyAdvancedFilter() {
    this.dialogRef?.close();
    this.onSubmit();
  }

  onSubmit() {
    const val = this.form.value;
    this.updateColumnDefs();
    const body = {
      withAvgRate: val.avgOption === 'withAvg',
      saudawise: val.option === 'SaudaWise',
      summary: val.option === 'Summary',
      netRate: val.avgOption === 'netRate',
      settlementWise: val.settlementWise,
      sharing: val.withSharing,
      brokerWise: val.brokerWise,
      withLedger: val.withLedgerBal,
      approvedItemsCombo:
        val.approvalStatus === 'Approved'
          ? 1
          : val.approvalStatus === 'NotApproved'
            ? 2
            : 0,
      dtP1: val.uptoDate ? format(val.uptoDate, 'yyyy-MM-dd') : '',
      exCodes: idsStringArr(val.exchange),
      fmlyIDs: idsStringArr(val.branch),
      parties: idsStringArr(val.account),
      saudas: '',
    };
    this.gridAPI?.setGridOption('loading', true);
    this.reportService.getSaudaStanding(body).subscribe({
      next: (res) => {
        const data = res.data ?? res;
        const option = this.form.get('option')?.value;
        if (option === 'PartyWise') {
          this.gridDataList = this.groupByKey(
            data,
            'bparty',
            ['bqnty', 'sqnty', 'mtm', 'netBal'],
            'sauda'
          );
        } else if (option === 'SaudaWise') {
          this.gridDataList = this.groupByKey(
            data,
            'sauda',
            ['bqnty', 'sqnty'],
            'scode'
          );
        } else {
          this.gridDataList = data;
        }
        // rowData is bound via Angular, no grid API call needed
      },
      error: () => {},
      complete: () => {
        setTimeout(() => {
          this.gridAPI?.setGridOption('loading', false);
        }, 300);
      }
    });
  }

  onGridReady(params: any) {
    this.gridAPI = params.api;
    // defer column update to avoid rendering conflict
    setTimeout(() => {
      this.updateColumnDefs();
    }, 0);
  }

  onFilteredChanged() {
    const filterTextBox = document.getElementById('filter-text-box');
    if (filterTextBox && this.gridAPI) {
      const inputElement = filterTextBox as HTMLInputElement;
      // small timeout avoids #252 render error
      setTimeout(() => {
        this.gridAPI?.setGridOption('quickFilterText', inputElement.value);
      }, 0);
    }
  }

  groupByKey(rows: any[], key: string, numericKeys: string[], displayField?: string): any[] {
    if (!Array.isArray(rows)) return [];
    const groups: Record<string, any[]> = {};
    rows.forEach(row => {
      const groupVal = row[key] || 'Unknown';
      if (!groups[groupVal]) groups[groupVal] = [];
      groups[groupVal].push(row);
    });

    const result: any[] = [];
    const disp = displayField || key;
    for (const [groupVal, groupRows] of Object.entries(groups)) {
      result.push({ isGroupHeader: true, [disp]: groupVal });
      result.push(...groupRows);
      const total: any = { isGroupTotal: true, [disp]: `Total: ${groupVal}` };
      for (const nKey of numericKeys) {
        total[nKey] = groupRows.reduce((sum, r) => sum + this.parseNumber(r[nKey]), 0);
      }
      if ('bqnty' in total && 'sqnty' in total) {
        total.netQty = total.bqnty - total.sqnty;
      }
      result.push(total);
    }
    return result;
  }

  getRowClass(params: any): string {
    const row = params.data;
    if (row?.isGroupHeader) return 'row-group-header';
    if (row?.isGroupTotal) return 'row-group-total';
    return '';
  }


  parseNumber(val: any): number {
    if (val === null || val === undefined) return 0;
    let str = String(val);
    const isNegative = str.includes('(') && str.includes(')');
    str = str.replace(/[()]/g, '');
    const cleaned = str.replace(/[^0-9.-]/g, '');
    let num = parseFloat(cleaned);
    if (isNaN(num)) num = 0;
    return isNegative ? -num : num;
  }

  numberWithArrowRenderer(params: any): string {
    const value = this.parseNumber(params.value);
    if (isNaN(value) || value === 0) {
      return '';
    }
    const cssClass = value < 0 ? 'loss-value' : 'profit-value';
    return `<span class="${cssClass}">${this.safeFormatCurrency(value)}</span>`;
  }

  qtyRenderer(params: any): string {
    const value = this.parseNumber(params.value);
    if (isNaN(value)) {
      return '';
    }
    return this.safeFormatQty(value);
  }

  onBtnExportCsv(): void {
    this.gridAPI?.exportDataAsCsv({ fileName: 'Standing Statement' });
  }

  downloadAsPDF() {
    if (!this.gridAPI) { return; }
    const columnKeys = this.columnDefs.map(c => c.field || c.headerName || '');
    const csvData = this.gridAPI.getDataAsCsv({
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

    const mainHeader = 'Standing Statement';
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

    doc.save('StandingStatement.pdf');
  }

  safeFormatCurrency(value: any): string {
    const num = parseFloat(value);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  safeFormatQty(value: any): string {
    const num = parseFloat(value);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    });
  }

  updateColumnDefs() {
    const option = this.form.get('option')?.value;
    if (option === 'Summary') {
      this.columnDefs = [...this.summaryColumnDefs];
    } else if (option === 'SaudaWise') {
      this.columnDefs = [...this.saudaWiseColumnDefs];
    } else {
      this.columnDefs = [...this.partyWiseColumnDefs];
    }
    // Allow Angular to update columnDefs then size columns
    setTimeout(() => {
      this.gridAPI?.sizeColumnsToFit();
    }, 0);
  }


  loadDropdowns() {
    forkJoin([
      this.ddlService.getBranchDDL(),
      this.ddlService.getExchangeNameDLL(),
      this.ddlService.getAccountDDL(),
    ]).subscribe({
      next: ([branchRes, exchangeRes, accountRes]) => {
        this.branchDDLList = branchRes.data;
        this.exchangeDDLList = exchangeRes.data;
        this.accountDDLList = accountRes.data;
      },
    });
  }
}
