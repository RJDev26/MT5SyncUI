import { Component, OnInit } from '@angular/core';
import { MasterService } from '../master.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AgGridModule, AgGridAngular } from "ag-grid-angular";
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { formatDate } from '../../../common/utils/numberformate';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
]);

@Component({
  selector: 'app-brokerage-setup',
  imports: [AgGridModule, AgGridAngular, MatInputModule, MatIconModule, FlexLayoutModule],
  templateUrl: './brokerage-setup.component.html',
  styleUrl: './brokerage-setup.component.scss'
})
export class BrokerageSetupComponent implements OnInit {
  gridAPI: any
  brokeragesetupList: any

  constructor(public snackBar: MatSnackBar, private _masterService: MasterService, public dialog: MatDialog) {
      
  }

  columnDefs: any = [
    // {
    //   headerName: 'Action', field: 'fileIcon', cellRenderer: this.actionCellRenderer, resizable: true, filter: false
    // },
    { headerName: 'Ac Code',  field: 'acCode', filter: true, sorting: true, resizable: true },
    { headerName: 'Ex code', field: 'excode',  filter: true, sorting: true, resizable: true },
    { headerName: 'Item Code', field: 'itemcode', filter: true, sorting: true, resizable: true },    
    { headerName: 'Brokerage Type',   field: 'broktype', filter: true, sorting: true, resizable: true },
    { headerName: 'Brokerage Rate', field: 'brokrate',   filter: true, sorting: true, resizable: true, type: 'rightAligned' },
    { headerName: 'Upto Stdt', field: 'uptostdt',  filter: true, sorting: true, resizable: true, valueFormatter: formatDate },
    { headerName: 'From Date', field: 'fromdate',  filter: true, sorting: true, resizable: true, valueFormatter: formatDate },
    { headerName: 'Pit BrokId', field: 'pitBrokId',  filter: true, sorting: true, resizable: true },
    { headerName: 'B Brokerage rate', field: 'bbrokrate',  filter: true, sorting: true, resizable: true },
    { headerName: 'Inst Type', field: 'insttype',  filter: true, sorting: true, resizable: true },
    { headerName: 'P Ex Brokerage Id', field: 'pexBrokId',  filter: true, sorting: true, resizable: true }
  ];

  agGridOptions: any = {
    defaultColDef: {
      filter: true,
      sortable: true,
      wraptext: true,
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

  ngOnInit(): void {
    this.initalApiCalls();
  }

  initalApiCalls() {
    this._masterService.getBrokeageSetupList().subscribe((results) => {
      debugger
      if (results.isSuccess) {
        this.brokeragesetupList = results.data;
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

  getBrokeageSetupList() {
    this._masterService.getExchangeTaxList().subscribe((results) => {
      debugger
      if (results.isSuccess) {
        this.brokeragesetupList = results.data;
      }
      else { this.showToaster(results.message, true); }
    });
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
    const params = {
      fileName:'Brokerage Setup List',
      columnKeys: [ 'acCode', 'excode', 'itemcode', 'broktype', 'brokrate', 'uptostdt', 'fromdate', 'pitBrokId', 'bbrokrate', 'insttype', 'pexBrokId' ]
     , customHeader:'Brokerage Setup List'
    }
    this.gridAPI.exportDataAsCsv(params);
  }

  downloadAsPDF() {
    const csvData = this.gridAPI.getDataAsCsv({
      columnKeys: [
        'acCode', 'excode', 'itemcode', 'broktype', 'brokrate', 'uptostdt', 'fromdate', 'pitBrokId', 'bbrokrate', 'insttype', 'pexBrokId'
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

    const mainHeader = "Brokerage Setup List";

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
      head: [['acCode', 'excode', 'itemcode', 'broktype', 'brokrate', 'uptostdt', 'fromdate', 'pitBrokId', 'bbrokrate', 'insttype', 'pexBrokId']],
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

    doc.save("BrokerageSetupList.pdf");
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
