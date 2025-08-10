import { Component, OnInit } from '@angular/core';
import { MasterService } from '../master.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { GridOptions } from 'ag-grid-community';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { formatAmount } from '../../../common/utils/numberformate';

@Component({
  selector: 'app-account-list',
  imports: [
    AgGridModule,
    AgGridAngular,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    CommonModule,
    FormsModule,
    FlexLayoutModule,
  ],
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent implements OnInit {
  gridAPI: any;
  accountList: any;
  statusOptions = ['Active', 'Inactive', 'All'];
  selectedStatus = 'Active';

  constructor(
    public snackBar: MatSnackBar,
    private _masterService: MasterService,
    public dialog: MatDialog
  ) {}

  columnDefs = [
    { headerName: 'Acc Id', field: 'accid', filter: true, sortable: true, resizable: true },
    { headerName: 'Account Code', field: 'acCode', filter: true, sortable: true, resizable: true },
    { headerName: 'Name', field: 'name', filter: true, sortable: true, resizable: true },
    {
      headerName: 'Opening Balance',
      field: 'opBal',
      filter: true,
      sortable: true,
      resizable: true,
      type: 'rightAligned',
      valueFormatter: formatAmount,
    },
    { headerName: 'Dr/Cr', field: 'drCr', filter: true, sortable: true, resizable: true },
    { headerName: 'Group Name', field: 'groupName', filter: true, sortable: true, resizable: true },
    { headerName: 'Head Name', field: 'HeadName', filter: true, sortable: true, resizable: true },
  ];

  agGridOptions: GridOptions = {
    defaultColDef: {
      filter: true,
      sortable: true,
      resizable: true,
    },
    suppressRowHoverHighlight: true,
  };

  onFilteredChanged() {
    const filterTextBox = document.getElementById('filter-text-box');
    if (filterTextBox) {
      const inputElement = filterTextBox as HTMLInputElement;
      setTimeout(() => {
        this.gridAPI.setGridOption('quickFilterText', inputElement.value);
      }, 0);
    } else {
      console.error('Element not found');
    }
  }

  onBtnExport(): void {
    const params = {
      fileName: 'Account List',
      columnKeys: ['accid', 'acCode', 'name', 'opBal', 'drCr', 'groupName', 'HeadName'],
      customHeader: 'Account List',
    };
    this.gridAPI.exportDataAsCsv(params);
  }

  downloadAsPDF() {
    const csvData = this.gridAPI.getDataAsCsv({
      columnKeys: ['accid', 'acCode', 'name', 'opBal', 'drCr', 'groupName', 'HeadName'],
      suppressQuotes: false,
      skipColumnHeaders: true,
    });

    const parsedData = Papa.parse(csvData, { header: false, skipEmptyLines: true });
    const dataRows = parsedData.data.slice(1);
    const doc = new jsPDF('l', 'pt', 'a4');

    const mainHeader = 'Account List';

    const addHeader = (doc: any, pageNumber: any) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      let xOffset = pageWidth / 2 - doc.getTextWidth(mainHeader) / 2;
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
      head: [['accid', 'acCode', 'name', 'opBal', 'drCr', 'groupName', 'HeadName']],
      body: dataRows as string[][],
      startY: 70,
      theme: 'grid',
      headStyles: { fillColor: [40, 53, 147] },
      columnStyles: {
        3: { halign: 'right', textColor: '#ff4848' },
      },
      didDrawCell: (data) => {
        const { row, column, section, cell } = data;
        if (section === 'body' && row.index === dataRows.length - 1) {
          doc.setFillColor(221, 221, 221);
          const { x, y, width, height } = cell;
          doc.rect(x, y, width, height, 'F');

          let textX = x + cell.padding('left');
          if (column.index === 3) {
            const textWidth = doc.getTextWidth(cell.text[0]);
            textX = x + width - cell.padding('right') - textWidth;
          }

          const textY = y + cell.height / 2 + 3;
          doc.text(cell.text, textX, textY);
        }
      },
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

    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }

    doc.save('AccountList.pdf');
  }

  ngOnInit(): void {
    this.initialApiCalls();
  }

  initialApiCalls() {
    this._masterService.getAccountList(this.selectedStatus).subscribe((results) => {
      if (results.isSuccess) {
        this.accountList = results.data;
        if (this.gridAPI) {
          this.gridAPI.sizeColumnsToFit();
        }
      } else {
        this.showToaster(results.message, true);
      }
    });
  }

  onGridReady(params: any) {
    this.gridAPI = params.api;
    this.gridAPI.sizeColumnsToFit();
  }

  onGridClick(event: any) {
    console.log('click');
  }

  onStatusChange() {
    this._masterService.getAccountList(this.selectedStatus).subscribe((results) => {
      if (results.isSuccess) {
        this.accountList = results.data;
        this.gridAPI?.sizeColumnsToFit();
      } else {
        this.showToaster(results.message, true);
      }
    });
  }

  showToaster(message: any, isError = false) {
    const panelClass = isError ? ['red-text'] : undefined;
    const label = isError ? 'Error' : 'Success';
    const time = isError ? 6000 : 3000;

    this.snackBar.open(message, label, {
      duration: time,
      panelClass: panelClass,
    });
  }
}
