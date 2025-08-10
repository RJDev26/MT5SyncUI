import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { FlexLayoutModule } from "@ngbracket/ngx-layout";
import { AgGridModule, AgGridAngular } from "ag-grid-angular";
import { GridOptions, GridApi, ColDef } from "ag-grid-community";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { DDLService } from "@services/ddl.service";
import { ReportService } from "@services/report.services";
import { format } from "date-fns";

@Component({
  selector: "app-trail-balance",
  standalone: true,
  templateUrl: "./trail-balance.component.html",
  styleUrls: ["./trail-balance.component.scss"],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    FlexLayoutModule,
    AgGridModule,
    AgGridAngular,
  ],
})
export class TrailBalanceComponent implements OnInit {
  form: FormGroup;
  branchDDLList: any[] = [];
  gridDataList: any[] = [];
  gridApi?: GridApi;
  pinnedBottomRowData: any[] = [];

  vouTypeOptions = [
    { label: "Journal (JV)", value: "JV" },
    { label: "Cash (CV)", value: "CV" },
    { label: "Settlement (S)", value: "S" },
    { label: "Shree (H)", value: "H" },
    { label: "Brok Share (B)", value: "B" },
    { label: "Intrest (I)", value: "I" },
    { label: "Marin (M)", value: "M" },
    { label: "Devedent (D)", value: "D" },
  ];

  columnDefs: ColDef[] = [
    { headerName: 'Dr Code', field: 'dr_AC_Code' },
    { headerName: 'Dr Name', field: 'dr_Name' },
    {
      headerName: 'Debit',
      field: 'debit',
      type: 'rightAligned',
      valueFormatter: (p) => this.safeFormatCurrency(p.value),
      cellClass: 'debit-column',
    },
    { headerName: 'Cr Code', field: 'cr_AC_Code' },
    { headerName: 'Cr Name', field: 'cr_Name' },
    {
      headerName: 'Credit',
      field: 'credit',
      type: 'rightAligned',
      valueFormatter: (p) => this.safeFormatCurrency(p.value),
      cellClass: 'credit-column',
    },
  ];

  agGridOptions: GridOptions = {
    defaultColDef: {
      filter: true,
      sortable: true,
      resizable: true,
      floatingFilter: true,
    },
    enableCellTextSelection: true,
    overlayLoadingTemplate:
      '<div class="custom-ag-loader"><div class="loader"></div><span>Loading...</span></div>',
    overlayNoRowsTemplate:
      '<span class="ag-overlay-loading-center">No rows to show</span>',
    suppressRowHoverHighlight: true,
  };

  constructor(
    private fb: FormBuilder,
    private ddlService: DDLService,
    private reportService: ReportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const currentDate = new Date();
    this.form = this.fb.group({
      fromDate: [currentDate, Validators.required],
      toDate: [currentDate, Validators.required],
      vouType: [''],
      branch: [''],
      includeOpBal: [true],
    });

    this.ddlService.getBranchDDL().subscribe({
      next: (res) => {
        this.branchDDLList = res.data;
        this.cdr.detectChanges();
      },
    });
  }

  onGridReady(event: any) {
    this.gridApi = event.api;
    this.gridApi?.sizeColumnsToFit();
    this.updateTotals();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value;
    const body = {
      fromDate: format(val.fromDate, 'yyyy-MM-dd') + 'T00:00:00',
      toDate: format(val.toDate, 'yyyy-MM-dd') + 'T00:00:00',
      vouType: val.vouType || '',
      branch: val.branch || '',
      includeOpBal: !!val.includeOpBal,
    };

    this.gridApi?.showLoadingOverlay();
    this.reportService.getTrialBalance(body).subscribe({
      next: (res) => {
        this.gridDataList = res?.data || [];
        this.cdr.detectChanges();
        setTimeout(() => {
          this.gridApi?.sizeColumnsToFit();
          this.updateTotals();
        }, 0);
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

  updateTotals() {
    if (!this.gridApi) return;
    let totalDebit = 0;
    let totalCredit = 0;
    this.gridApi.forEachNodeAfterFilter((node) => {
      const data = node.data || {};
      totalDebit += parseFloat(data.debit) || 0;
      totalCredit += parseFloat(data.credit) || 0;
    });
    const diff = totalDebit - totalCredit;
    const rows: any[] = [
      {
        dr_Name: 'Total',
        debit: totalDebit,
        cr_Name: 'Total',
        credit: totalCredit,
      },
    ];
    if (diff !== 0) {
      rows.push({
        dr_Name: 'Difference',
        debit: diff > 0 ? diff : '',
        credit: diff < 0 ? Math.abs(diff) : '',
      });
    }
    this.pinnedBottomRowData = rows;
  }

  onBtnExportCsv(): void {
    this.gridApi?.exportDataAsCsv({ fileName: 'Trial Balance' });
  }

  downloadAsPDF() {
    if (!this.gridApi) { return; }
    const columnKeys = this.columnDefs.map(c => c.field || c.headerName || '');
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

    const mainHeader = 'Trial Balance';
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

    doc.save('TrialBalance.pdf');
  }

  safeFormatCurrency(value: any): string {
    const num = parseFloat(value);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
