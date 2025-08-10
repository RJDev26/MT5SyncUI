import { Component, OnInit } from '@angular/core';
import { MasterService } from '../master.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AgGridModule, AgGridAngular } from "ag-grid-angular";
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import type { GridOptions } from 'ag-grid-community';
import { MatGridListModule } from '@angular/material/grid-list';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

@Component({
  selector: 'app-item-master',
  imports: [AgGridModule, AgGridAngular, MatInputModule, MatIconModule, CommonModule, MatGridListModule, FlexLayoutModule],
  templateUrl: './item-master.component.html',
  styleUrl: './item-master.component.scss'
})
export class ItemMasterComponent implements OnInit {
  gridAPI: any
  itemMasterList: any

  constructor(public snackBar: MatSnackBar, private _masterService: MasterService, public dialog: MatDialog) {
      
  }

  columnDefs = [
    // {
    //   headerName: 'Action', field: 'fileIcon', cellRenderer: this.actionCellRenderer, minWidth: 110,
    //   maxWidth: 110, resizable: false, filter: false
    // },
    { headerName: 'Comp Code', field: 'compCode', filter: true, sorting: true, resizable: true },
    { headerName: 'Item Code', field: 'itemcode', filter: true, sorting: true, resizable: true },
    { headerName: 'Item Name', field: 'itemname', filter: true, sorting: true, resizable: true },
    { headerName: 'Lot', field: 'lot', filter: true, sorting: true, resizable: true },
    { headerName: 'Exh Code', field: 'exhcode', filter: true, sorting: true, resizable: true },
    { headerName: 'Exchange Code', field: 'exchangecode', filter: true, sorting: true, resizable: true },           
    { headerName: 'CTT App', field: 'cttapp', filter: true, sorting: true, resizable: true },
    { headerName: 'Risk Mapp', field: 'riskmapp', filter: true, sorting: true, resizable: true },
    { headerName: 'St Mapp', field: 'stmapp', filter: true, sorting: true, resizable: true },
    { headerName: 'CTT Date', field: 'cttdate', filter: true, sorting: true, resizable: true },
    { headerName: 'Item ID', field: 'itemid', filter: true, sorting: true, resizable: true },
    { headerName: 'Ex ID', field: 'exid', filter: true, sorting: true, resizable: true },
    { headerName: 'Sebi Tax Opt', field: 'sebitaxopt', filter: true, sorting: true, resizable: true },
    { headerName: 'STC Tax', field: 'stctax', filter: true, sorting: true, resizable: true },
    { headerName: 'Cite Mid', field: 'citemid', filter: true, sorting: true, resizable: true },
    { headerName: 'Group ID', field: 'groupid', filter: true, sorting: true, resizable: true },
  ];

  agGridOptions: GridOptions = {
    defaultColDef: {
      filter: true,
      sortable: true,
      resizable: true,    
    },
    suppressRowHoverHighlight: true,    
  }

  public actionCellRenderer(params: any) {
    let eGui = document.createElement("div");
    let editingCells = params.api.getEditingCells();
    let isCurrentRowEditing = editingCells.some((cell: any) => {
      return cell.rowIndex === params.node.rowIndex;
    });
    eGui.innerHTML = `<button class="material-icons action-button-edit" data-action="edit">edit</button>
                      <button class="material-icons action-button-red" delete data-action="delete">delete</button>`;
    return eGui;
  }

  onFilteredChanged() {
    const filterTextBox = document.getElementById('filter-text-box');
    if (filterTextBox) {
        const inputElement = filterTextBox as HTMLInputElement;
        setTimeout(() => {
          this.gridAPI.setGridOption(
            'quickFilterText',
            inputElement.value
          );
        }, 0);
    } else {
        console.error('Element not found');
    }
  }

  onBtnExport(): void {
    const params =
    {
      fileName:'Item Master List',
      columnKeys: [ 'compCode', 'itemcode', 'itemname', 'lot', 'exhcode', 'exchangecode', 'cttapp', 'riskmapp', 'stmapp', 'cttdate', 'itemid', 'exid', 'sebitaxopt', 'stctax', 'citemid', 'groupid' ]
      , customHeader:'Item Master List'
    }
    this.gridAPI.exportDataAsCsv(params);
  }

  downloadAsPDF() {
    const csvData = this.gridAPI.getDataAsCsv({
      columnKeys: [
        'compCode', 'itemcode', 'itemname', 'lot', 'exhcode', 'exchangecode', 'cttapp', 'riskmapp', 'stmapp', 'cttdate', 'itemid', 'exid', 'sebitaxopt', 'stctax', 'citemid', 'groupid'
      ],
      suppressQuotes: false,
      skipColumnHeaders: true,
    });

    const parsedData = Papa.parse(csvData, {
      header: false,
      skipEmptyLines: true,
    });
    const dataRows = parsedData.data.slice(1);
    const doc = new jsPDF("l", "pt", "a4");

    const mainHeader = "Item Master List";

    const addHeader = (doc: any, pageNumber: any) => {
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      let xOffset = pageWidth / 2 - doc.getTextWidth(mainHeader) / 2;
      doc.text(mainHeader, xOffset, 20);

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.setLineCap(2);
      doc.line(40, 30, pageWidth - 40, 30);

      // Subheader
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.setLineCap(2);
      doc.line(40, 60, pageWidth - 40, 60);
    };

    const totalPagesExp = "{total_pages_count_string}";

    addHeader(doc, 1);

    autoTable(doc, {
      head: [['compCode', 'itemcode', 'itemname', 'lot', 'exhcode', 'exchangecode', 'cttapp', 'riskmapp', 'stmapp', 'cttdate', 'itemid', 'exid', 'sebitaxopt', 'stctax', 'citemid', 'groupid']],
      body: dataRows as string[][],
      startY: 70,
      theme: "grid",
      headStyles: { fillColor: [40, 53, 147] },
      columnStyles: {
        2: { halign: "right", textColor: "#ff4848" },
        5: { halign: "right", textColor: "green" },
      },
      didDrawCell: (data) => {
        const { row, column, section, cell } = data;
        if (section === "body" && row.index === dataRows.length - 1) {
          doc.setFillColor(221, 221, 221);
          const { x, y, width, height } = cell;
          doc.rect(x, y, width, height, "F");

          let textX = x + cell.padding("left");
          if (column.index === 2 || column.index === 5) {
            const textWidth = doc.getTextWidth(cell.text[0]);
            textX = x + width - cell.padding("right") - textWidth;
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
        const tableHeight = data?.cursor?.y || 0 - tableStartY;

        const footerText = `Page ${data.pageNumber} of ${totalPagesExp}`;
        const xOffset = 40;
        doc.text(footerText, xOffset, doc.internal.pageSize.height - 20);

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1);
        doc.rect(tableStartX, tableStartY, tableWidth - 80, tableHeight);
      },
    });

    if (typeof doc.putTotalPages === "function") {
      doc.putTotalPages(totalPagesExp);
    }

    doc.save("ItemMasterList.pdf");
  }

  ngOnInit(): void {
    this.initalApiCalls();
  }

  initalApiCalls() {
    this._masterService.getItemMasterList().subscribe((results) => {
      debugger
      if (results.isSuccess) {
        this.itemMasterList = results.data;
      }
      else { this.showToaster(results.message, true); }
    });
  }

  onGridReady(params: any) {
    this.gridAPI = params.api;
  }

  onGridClick(event: any) {
    console.log("click");
  }

  getItemMasterList() {
    this._masterService.getItemMasterList().subscribe((results) => {
      debugger
      if (results.isSuccess) {
        this.itemMasterList = results.data;
      }
      else { this.showToaster(results.message, true); }
    });
  }

  showToaster(message: any, isError = false) {
    const panelClass = isError ? ['red-text'] : undefined;
    const label = isError ? "Error" : "Success";
    const time = isError? 6000 : 3000;
  
    this.snackBar.open(message, label, {
      duration: time,
      panelClass: panelClass,
    });
  }
}
