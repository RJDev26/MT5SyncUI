import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { AgGridModule, AgGridAngular } from 'ag-grid-angular';
import { GridOptions, GridApi, ColDef } from 'ag-grid-community';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { DDLService } from '@services/ddl.service';
import { ReportService } from '@services/report.services';
import { format } from 'date-fns';
import { MultiSelectComponent } from '../../../common/components/multi-select/multi-select.component';
import { idsStringArr } from '../../../common/utils/common-funs';

@Component({
  selector: 'app-ledger-report',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    FlexLayoutModule,
    MultiSelectComponent,
    AgGridModule,
    AgGridAngular,
  ],
  templateUrl: './ledger-report.component.html',
  styleUrls: ['./ledger-report.component.scss'],
})
export class LedgerReportComponent implements OnInit {
  form: FormGroup;
  branchDDLList: any[] = [];
  accountDDLList: any[] = [];
  gridDataList: any[] = [];
  gridApi?: GridApi;
  pageSize = 50;

  @ViewChild('advancedFilterDialog')
  advancedFilterDialog!: TemplateRef<any>;
  private dialogRef?: MatDialogRef<any>;

  vouTypeOptions = [
    { label: 'Journal (JV)', value: 'JV' },
    { label: 'Cash (CV)', value: 'CV' },
    { label: 'Settlement (S)', value: 'S' },
    { label: 'Shree (H)', value: 'H' },
    { label: 'Brok Share (B)', value: 'B' },
    { label: 'Intrest (I)', value: 'I' },
    { label: 'Marin (M)', value: 'M' },
    { label: 'Devedent (D)', value: 'D' },
  ];

  columnDefs: ColDef[] = [
    {
      headerName: 'Vou No',
      field: 'voU_NO',
      valueGetter: (p) => (p.data?.isGroup ? p.data.name : p.data?.voU_NO),
      cellStyle: (p) => (p.data?.isGroup ? { fontWeight: 'bold' } : undefined),
      colSpan: (p) => (p.data?.isGroup ? 3 : 1),
    },
    {
      headerName: 'Date',
      field: 'entryDate',
      valueGetter: (p) =>
        p.data?.entryDate
          ? format(new Date(p.data.entryDate), 'dd/MM/yyyy')
          : '',
    },
    { headerName: 'Narration', field: 'narration' },
    {
      headerName: 'Debit',
      field: 'debit',
      type: 'rightAligned',
      valueFormatter: (p) => this.safeFormatCurrency(p.value),
      cellClass: 'debit-column',
    },
    {
      headerName: 'Credit',
      field: 'credit',
      type: 'rightAligned',
      valueFormatter: (p) => this.safeFormatCurrency(p.value),
      cellClass: 'credit-column',
    },
    {
      headerName: 'Balance',
      field: 'balance',
      type: 'rightAligned',
      valueFormatter: (p) => this.safeFormatCurrency(p.value),
      cellClass: (p) => (this.parseNumber(p.value) < 0 ? 'balance-neg' : 'balance-pos'),
    },
  ];

  agGridOptions: GridOptions = {
    defaultColDef: {
      filter: true,
      sortable: true,
      resizable: true,
    },
    enableCellTextSelection: true,
    pagination: true,
    overlayLoadingTemplate:
      '<div class="custom-ag-loader"><div class="loader"></div><span>Loading...</span></div>',
    overlayNoRowsTemplate:
      '<span class="ag-overlay-loading-center">No rows to show</span>',
    suppressRowHoverHighlight: true,
    rowClassRules: {
      'group-row': (p) => !!p.data?.isGroup,
    },
  };

  constructor(
    private fb: FormBuilder,
    private ddlService: DDLService,
    private reportService: ReportService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const currentDate = new Date();
    this.form = this.fb.group({
      fromDate: [currentDate, Validators.required],
      toDate: [currentDate, Validators.required],
      branch: [],
      account: [],
      vouType: [],
      includeOpBal: [true],
      settlementEntry: ['Daily'],
      viewType: ['ExchangeWise'],
    });

    this.ddlService.getBranchDDL().subscribe({
      next: (res) => (this.branchDDLList = res.data || res),
    });

    this.ddlService.getAccountDDL().subscribe({
      next: (res) => (this.accountDDLList = res.data || res),
    });
  }

  openAdvancedFilter() {
    this.dialogRef = this.dialog.open(this.advancedFilterDialog);
  }

  applyAdvancedFilter() {
    this.dialogRef?.close();
    this.onSubmit();
  }

  onGridReady(event: any) {
    this.gridApi = event.api;
    if (this.gridApi) {
      this.gridApi.setGridOption('paginationPageSize', this.pageSize);
      this.gridApi.sizeColumnsToFit();
    }
  }


  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value;
    const body = {
      fromDate: format(val.fromDate, 'yyyy-MM-dd'),
      toDate: format(val.toDate, 'yyyy-MM-dd'),
      accIDList: idsStringArr(val.account),
      includeOpeningBalance: !!val.includeOpBal,
      voucherTypes: (val.vouType || []).map((v: any) => v.value).join(','),
      weekWise: val.settlementEntry === 'WeekWise',
      weekWiseNet: val.settlementEntry === 'WeekNet',
      exchangeWise: val.viewType === 'ExchangeWise',
      clientNet: val.viewType === 'ClientWise',
    };

    this.gridApi?.showLoadingOverlay();
    this.reportService.getGeneralLedger(body).subscribe({
      next: (res) => {
        const rawData = res?.data || res;
        this.gridDataList = this.groupLedgerData(rawData);
        this.cdr.detectChanges();
        setTimeout(() => this.gridApi?.sizeColumnsToFit(), 0);
        if (this.gridApi) {
          if (this.gridDataList.length) {
            this.gridApi.hideOverlay();
          } else {
            this.gridApi.showNoRowsOverlay();
          }
        }
      },
      error: () => {
        this.gridApi?.hideOverlay();
      },
    });
  }

  onFilteredChanged() {
    const input = document.getElementById('filter-text-box') as HTMLInputElement | null;
    if (input && this.gridApi) {
      this.gridApi.setGridOption('quickFilterText', input.value);
    }
  }

  onBtnExportCsv(): void {
    this.gridApi?.exportDataAsCsv({ fileName: 'GeneralLedger' });
  }

  downloadAsPDF() {
    if (!this.gridApi) {
      return;
    }
    const columnKeys = this.columnDefs.map((c) => c.field || c.headerName || '');
    const csvData = this.gridApi.getDataAsCsv({
      columnKeys,
      suppressQuotes: false,
      skipColumnHeaders: true,
    });

    const parsedData = Papa.parse(csvData as string, {
      header: false,
      skipEmptyLines: true,
    });
    const dataRows = (parsedData.data as string[][]).slice(1);
    const doc = new jsPDF('l', 'pt', 'a4');

    const mainHeader = 'General Ledger';
    const addHeader = (doc: any, pageNumber: number) => {
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

    doc.save('GeneralLedger.pdf');
  }

  groupLedgerData(data: any[]): any[] {
    const groups = new Map<string, any[]>();
    data.forEach((row) => {
      const name = row.name || '';
      if (!groups.has(name)) {
        groups.set(name, []);
      }
      groups.get(name)!.push(row);
    });
    const result: any[] = [];
    groups.forEach((rows, name) => {
      const debitTotal = rows.reduce((sum, r) => sum + (parseFloat(r.debit) || 0), 0);
      const creditTotal = rows.reduce((sum, r) => sum + (parseFloat(r.credit) || 0), 0);
      const balance = rows.length ? rows[rows.length - 1].balance : 0;
      result.push({ name, debit: debitTotal, credit: creditTotal, balance, isGroup: true });
      result.push(...rows);
    });
    return result;
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

  safeFormatCurrency(value: any): string {
    const num = parseFloat(value);
    if (isNaN(num) || num === 0) return '';
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
