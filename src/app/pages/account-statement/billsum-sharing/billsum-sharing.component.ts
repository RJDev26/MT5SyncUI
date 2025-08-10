import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DDLService } from '@services/ddl.service';
import { forkJoin } from 'rxjs';
import { MultiSelectComponent } from '../../../common/components/multi-select/multi-select.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ReportService } from '@services/report.services';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { GridOptions, IsFullWidthRowParams, GridApi } from 'ag-grid-community';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatButtonModule } from '@angular/material/button';
import { FullWidthCellRenderer } from './full-width-cell-renderer.component';
import { formatCurrency, formatAmount } from '../../../common/utils/numberformate';
import { MAT_DATE_FORMATS, DateAdapter, NativeDateAdapter } from '@angular/material/core';  // Import NativeDateAdapter
import { MatNativeDateModule } from '@angular/material/core';  // Ensure this is imported
import { idsStringArr } from '../../../common/utils/common-funs';
import { format } from 'date-fns';


// Define the custom date format
// Define the custom date format
export const MY_DATE_FORMATS = {
  display: {
    dateInput: 'dd/MM/YYYY',  // Format for displaying date in the input field
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};



@Component({
  selector: 'app-billsum-sharing',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    MatDatepickerModule,
    MatSelectModule,
    AgGridModule,
    AgGridAngular,
    MatIconModule,
    CommonModule,
    MatGridListModule,
    FlexLayoutModule,
    MatButtonModule,
    MatNativeDateModule,
  ],
  templateUrl: './billsum-sharing.component.html',
  styleUrls: ['./billsum-sharing.component.scss'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: DateAdapter, useClass: NativeDateAdapter },  // Corrected this part



  ],
})


export class BillsumSharingComponent implements OnInit {
  form: FormGroup;
  branchDDLList: any;
  exchangeDDLList: any;
  accountDDLList: any;
  gridAPI: GridApi;
  gridDataList: any = []; 
  optionsList = {
    '1': 'Detail',
    '2': 'Summary',
    '3': 'SummaryExchangeWise',
    '4': 'CONSOLIDATED',
    '5': 'CONSOLIDATED-2'
  }
  columnDefs: any = [];



  columnDefSummaryExchangeWise: any = [
    { headerName: 'Party Name', field: 'name', filter: true, sortable: true, resizable: true },
    { headerName: 'MTM Amount', field: 'billamt', filter: true, sortable: true, resizable: true },
    { headerName: 'Brok Amount', field: 'brokamt', filter: true, sortable: true, resizable: true },
    { headerName: 'Total Amount', field: 'totamt', filter: true, sortable: true, resizable: true },
    { headerName: 'Br Brok', field: 'ibrokshare', filter: true, sortable: true, resizable: true, valueFormatter: formatAmount },
    { headerName: 'Share %', field: 'sharerate', filter: true, sortable: true, resizable: true, valueFormatter: formatAmount },
    { headerName: 'Br Share', field: 'shareamt', filter: true, sortable: true, resizable: true },
    { headerName: 'Net Amount', field: 'netamt', filter: true, sortable: true, resizable: true },
    { headerName: 'Turnover', field: 'turnover', filter: true, sortable: true, resizable: true },
  ]

  columnDefConsolidated: any = [
    { headerName: 'Party Name', field: 'fmlyname', filter: true, sortable: true, resizable: true },
    { headerName: 'MTM Amount', field: 'billamt', filter: true, sortable: true, resizable: true },
    { headerName: 'Brok Amount', field: 'brokamt', filter: true, sortable: true, resizable: true },
    { headerName: 'Total Amount', field: 'totamt', filter: true, sortable: true, resizable: true },
    { headerName: 'Br Brok', field: 'ibrokshare', filter: true, sortable: true, resizable: true },
    { headerName: 'Br Share', field: 'shareamt', filter: true, sortable: true, resizable: true },
    { headerName: 'Net Amount', field: 'netamt', filter: true, sortable: true, resizable: true },
  ]

  columnDefConsolidatedTwo: any = [
    { headerName: 'Code', field: 'code', filter: true, sortable: true, resizable: true },
    { headerName: 'Name', field: 'name', filter: true, sortable: true, resizable: true },
    { headerName: 'Credit Amount', field: 'crAmt', filter: true, sortable: true, resizable: true },
    { headerName: 'RCODE', field: 'rCode', filter: true, sortable: true, resizable: true },
    { headerName: 'RNAME', field: 'rName', filter: true, sortable: true, resizable: true },
    { headerName: 'Debit Amount', field: 'drAmt', filter: true, sortable: true, resizable: true }
  ]


  // ✅ Row class logic goes here
  getRowClass(params: any): string {
    const row = params.data;
    if (row?.isHeaderRow) return 'row-family-header';
    if (row?.isSubHeaderRow) return 'row-party-header';
    if (row?.isGroupTotal) return 'row-party-total';
    if (row?.isFamilyTotal) return 'row-family-total';
    if (row?.isGrandTotal) return 'row-grand-total';
    return '';
  }



  agGridOptions: GridOptions = {
    overlayLoadingTemplate:
      '<div class="custom-ag-loader"><div class="loader"></div><span>Loading...</span></div>',
    overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">No rows to show</span>',

    suppressHorizontalScroll: false,
    onGridReady: (params) => {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
       
      }, 100); // slight delay ensures grid is rendered
    },
    defaultColDef: {
      resizable: true,
      flex: 1,        // THIS makes columns expand to fill space
      minWidth: 100
    },
    suppressRowHoverHighlight: true,
    //getRowClass: (params) => {
    //  return params.data && params.data.isGroupTotal ? 'group-footer-row' : '';
    //},
    getRowClass: this.getRowClass.bind(this),
  };

  //agGridOptions: GridOptions = {
  //  defaultColDef: {
  //    filter: true,
  //    sortable: true,
  //    resizable: true,
  //  },
  //  suppressRowHoverHighlight: true,
  //  getRowClass: (params) => {
  //    return params.data && params.data.isGroupTotal ? 'group-footer-row' : '';
  //  },
  //};
  constructor(
    private ddlService: DDLService,
    private formBuilder: FormBuilder,
    private reportServices: ReportService
  ) { }

  ngOnInit(): void {
    this.initalApiCalls();
    this.initalizeForm();
  }


  public saverange() {
    if (this.form.get('option')?.value === 'Summary') {
      this.columnDefs  = [

        //{ headerName: 'Party Name', field: 'name', filter: true, sortable: true, resizable: true },
        {
          headerName: 'Party Name',
          field: 'name',
          colSpan: (params: any) => {
            const data = params.data;
            if (data?.isGroupHeader) {
              return 8; // Number of columns in total
            }
            return 1;
          },
          cellStyle: (params:any) => {
            const data = params.data;
            if (data?.isGroupHeader) {
              return {
                fontWeight: 'bold',
                backgroundColor: '#e3f2fd', // Light blue
                color: '#0d47a1'
              };
            }
            if (data?.isGroupTotal) {
              return {
                fontWeight: 'bold',
             //   backgroundColor: '#fbe9e7', // Light orange
                color: 'black'
              };
            }
            if (data?.isAccountSummary) {
              return {
                fontWeight: 'bold',
                backgroundColor: '#f1f8e9', // Light green
                color: '#33691e'
              };
            }
            return null;
          },
          //cellRenderer: (params:any) => {
          //  const data = params.data;
          //  if (data?.isGroupHeader || data?.isGroupTotal) {
          //    return data.name;
          //  }
          //  return data.name;
          //},
          filter: true,
          sortable: true,
          resizable: true
        },

        { headerName: 'MTM Amount', field: 'diffamt', cellRenderer: this.netAmtWithArrowRenderer.bind(this), filter: true, sortable: true, resizable: true, type: 'rightAligned' },
        { headerName: 'Brok Amount', field: 'brokamt', cellRenderer: this.netAmtWithArrowRenderer.bind(this), filter: true, sortable: true, resizable: true, type: 'rightAligned' },
        { headerName: 'Total Amount', field: 'billamt', cellRenderer: this.netAmtWithArrowRenderer.bind(this), filter: true, sortable: true, resizable: true, type: 'rightAligned' },
        { headerName: 'Br Brok', field: 'ibrokshare', cellRenderer: this.netAmtWithArrowRenderer.bind(this), filter: true, sortable: true, resizable: true, type: 'rightAligned' },
        { headerName: 'Share %', field: 'sharerate', filter: true, sortable: true, resizable: true, type: 'rightAligned' },
        { headerName: 'Br Share', field: 'shareamt', cellRenderer: this.netAmtWithArrowRenderer.bind(this), filter: true, sortable: true, resizable: true, type: 'rightAligned' },
        { headerName: 'Net Amount', field: 'netamt', cellRenderer: this.netAmtWithArrowRenderer.bind(this), filter: true, sortable: true, resizable: true, type: 'rightAligned' },
      ];
    } else if (this.form.get('option')?.value === 'Detail') {

      this.columnDefs = [
        {
          headerName: 'Contract Name',
          field: 'saudacode',
          colSpan: (params: any) => {
            const data = params?.data;
            if (data?.isGroupHeader) {
              return 7; // Span entire row for group header only
            }
            return 1; // Keep columns visible for totals and normal rows
          },
        
          cellRenderer: (params: any) => {
            const data = params.data;
            if (data?.isGroupHeader) return `Family: ${data.fmlyname} / ${data.name}`;
            if (data?.isGroupTotal) return `${data.name}`; // Will show only in 1st col
            if (data?.isFamilyTotal) return `Family Total: ${data.fmlyname}`;
            if (data?.isGrandTotal) return 'Grand Total';
            return data?.saudacode;
          },


          cellStyle: (params: any) => {
            const data = params.data;
            if (data?.isGroupHeader || data?.isGroupTotal || data?.isFamilyTotal || data?.isGrandTotal) {
              return { fontWeight: 'bold', backgroundColor: '#f1f1f1' };
            }
            return null;
          }
        },
        { headerName: 'MTM Amount', field: 'billamt', type: 'rightAligned', cellRenderer: this.netAmtWithArrowRenderer.bind(this) },
        { headerName: 'Brok Amount', field: 'brokamt', type: 'rightAligned', cellRenderer: this.netAmtWithArrowRenderer.bind(this) },
        { headerName: 'Total Amount', field: 'totamt', type: 'rightAligned', cellRenderer: this.netAmtWithArrowRenderer.bind(this) },
        { headerName: 'Br Brok', field: 'ibrokshare', type: 'rightAligned', valueFormatter: formatAmount, cellRenderer: this.netAmtWithArrowRenderer.bind(this) },
        { headerName: 'Br Share', field: 'shareamt', type: 'rightAligned', cellRenderer: this.netAmtWithArrowRenderer.bind(this) },
        { headerName: 'Net Amount', field: 'netamt', type: 'rightAligned', cellRenderer: this.netAmtWithArrowRenderer.bind(this) }
      ];





    } else if (this.form.get('option')?.value === 'SummaryExchangeWise') {
      this.columnDefs = [
        { field: 'name' },
        { field: 'billamt', type: 'rightAligned', valueFormatter: formatCurrency },
        { field: 'brokamt', type: 'rightAligned', valueFormatter: formatCurrency },
        { field: 'totamt', type: 'rightAligned', valueFormatter: formatCurrency },
        { field: 'ibrokshare', type: 'rightAligned', valueFormatter: formatAmount },
        { field: 'sharerate', type: 'rightAligned', valueFormatter: formatAmount },
        { field: 'shareamt', type: 'rightAligned', valueFormatter: formatCurrency },
        { field: 'netamt', type: 'rightAligned', valueFormatter: formatCurrency },
        { field: 'turnover', type: 'rightAligned', valueFormatter: formatCurrency }
      ];
    } else if (this.form.get('option')?.value === 'CONSOLIDATED') {
      this.columnDefs = [
        { headerName: 'Party Name', field: 'fmlyname' },
        { headerName: 'MTM Amount', field: 'billamt', type: 'rightAligned', valueFormatter: formatCurrency },
        { headerName: 'Brok Amount', field: 'brokamt', type: 'rightAligned', valueFormatter: formatCurrency },
        { headerName: 'Total Amount', field: 'totamt', type: 'rightAligned', valueFormatter: formatCurrency },
        { headerName: 'Br Brok', field: 'ibrokshare', type: 'rightAligned', valueFormatter: formatCurrency },
        { headerName: 'Br Share', field: 'shareamt', type: 'rightAligned', valueFormatter: formatCurrency },
        { headerName: 'Net Amount', field: 'netamt', type: 'rightAligned', valueFormatter: formatCurrency },
      ];
    } else if (this.form.get('option')?.value === 'CONSOLIDATED-2') {
      this.columnDefs = [
        { headerName: 'Code', field: 'code' },
        { headerName: 'Name', field: 'name' },
        { headerName: 'Credit Amount', field: 'crAmt', type: 'rightAligned', valueFormatter: formatCurrency },
        { headerName: 'RCODE', field: 'rCode' },
        { headerName: 'RName', field: 'rName' },
        { headerName: 'Debit Amount', field: 'drAmt', type: 'rightAligned', valueFormatter: formatCurrency }
      ];
    }
  }



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

  onGridReady(params: any) {
    this.gridAPI = params.api;
    
  }

  onGridClick(event: any) {
    console.log('click');
  }

  initalizeForm() {
    const currentDate = new Date();
    this.form = this.formBuilder.group({
      fromDate: [currentDate, Validators.required],
      toDate: [currentDate, Validators.required],
      account: ['', Validators.required],
      exId: ['', Validators.required],
      branchIds: ['', Validators.required],
      option: ['Summary', Validators.required],
    });
  }

  //groupBillSumDataSharingDetail(data: any[]): any[] {
  //  const groupedRows: any[] = [];

  //  if (!Array.isArray(data)) {
  //    console.warn('Expected array but got:', data);
  //    return groupedRows;
  //  }

  //  // Step 1: Group by fmlyname + name
  //  const groupedByKey = data.reduce((acc, row) => {
  //    const fmlyname = row.fmlyname || 'Unknown Family';
  //    const name = row.name || 'Unknown Name';
  //    const key = `${fmlyname}__${name}`;
  //    if (!acc[key]) acc[key] = [];
  //    acc[key].push(row);
  //    return acc;
  //  }, {} as Record<string, any[]>);

  //  // Step 2: Flatten into grouped rows
  //  for (const [key, rows] of Object.entries(groupedByKey)) {
  //    const [fmlyname, name] = key.split('__');

  //    // Group header row
  //    groupedRows.push({
  //      isGroupHeader: true,
  //      fmlyname,
  //      name,
  //      groupLabel: `${fmlyname} / ${name}`
  //    });

  //    if (Array.isArray(rows)) {
  //      groupedRows.push(...rows);

  //      // Group total row
  //      groupedRows.push({
  //        isGroupTotal: true,
  //        fmlyname,
  //        name,
  //        billamt: rows.reduce((sum, r) => sum + (+r.billamt || 0), 0),
  //        brokamt: rows.reduce((sum, r) => sum + (+r.brokamt || 0), 0),
  //        totamt: rows.reduce((sum, r) => sum + (+r.totamt || 0), 0),
  //        ibrokshare: rows.reduce((sum, r) => sum + (+r.ibrokshare || 0), 0),
  //        shareamt: rows.reduce((sum, r) => sum + (+r.shareamt || 0), 0),
  //        netamt: rows.reduce((sum, r) => sum + (+r.netamt || 0), 0),
  //        groupLabel: `Total for ${fmlyname} / ${name}`
  //      });
  //    }
  //  }

  //  return groupedRows;
  //}
  groupBillSumDataSharingDetail(data: any[]): any[] {
    const groupedRows: any[] = [];

    const numericKeys = ['billamt', 'brokamt', 'totamt', 'ibrokshare', 'shareamt', 'netamt'];
    const grandTotals: Record<string, number> = Object.fromEntries(numericKeys.map(k => [k, 0]));

    // Group by fmlyname
    const fmlyGroups = data.reduce((acc: Record<string, any[]>, row) => {
      const fmlyname = row.fmlyname || 'Unknown Family';
      if (!acc[fmlyname]) acc[fmlyname] = [];
      acc[fmlyname].push(row);
      return acc;
    }, {});

    for (const [fmlyname, fmlyItems] of Object.entries(fmlyGroups)) {
      const familyTotal = Object.fromEntries(numericKeys.map(k => [k, 0]));

      // Group by name
      const nameGroups = fmlyItems.reduce((acc: Record<string, any[]>, row) => {
        const name = row.name || 'Unknown Name';
        if (!acc[name]) acc[name] = [];
        acc[name].push(row);
        return acc;
      }, {});

      for (const [name, rows] of Object.entries(nameGroups)) {
        // Header row (optional)
        groupedRows.push({
          isGroupHeader: true,
          fmlyname,
          name,
          groupLabel: `${fmlyname} / ${name}`
        });

        // Actual rows
        groupedRows.push(...rows);

        // Name total
        const nameTotal = Object.fromEntries(numericKeys.map(k => [k, 0]));
        rows.forEach(row => {
          numericKeys.forEach(k => {
            nameTotal[k] += Number(row[k]) || 0;
          });
        });

        groupedRows.push({
          isGroupTotal: true,
          fmlyname,
          name: `Total for ${name}`,
          ...nameTotal
        });

        numericKeys.forEach(k => {
          familyTotal[k] += nameTotal[k];
        });
      }

      // Family total
      groupedRows.push({
        isFamilyTotal: true,
        fmlyname,
        name: `Family Total: ${fmlyname}`,
        ...familyTotal
      });

      numericKeys.forEach(k => {
        grandTotals[k] += familyTotal[k];
      });
    }

    // Grand total
    groupedRows.push({
      isGrandTotal: true,
      name: 'Grand Total',
      ...grandTotals
    });

    return groupedRows;
  }


  groupBillSumDataSharing(data: any[]) {
    const groupedResult: any[] = [];
    const fmlyMap: { [key: string]: any[] } = {};

    // Group by fmlycode
    data.forEach((item) => {
      if (!fmlyMap[item.fmlyname]) {
        fmlyMap[item.fmlyname] = [];
      }
      fmlyMap[item.fmlyname].push(item);
    });

    // Iterate fmlycode groups
    Object.entries(fmlyMap).forEach(([fmlyname, fmlyItems]) => {
      groupedResult.push({ singleAccount: fmlyname });

      const acCodeMap: { [key: string]: any[] } = {};

      // Group by ac_code inside this fmlycode
      fmlyItems.forEach((item) => {
        if (!acCodeMap[item.name]) {
          acCodeMap[item.name] = [];
        }
        acCodeMap[item.name].push(item);
      });

      // Push one row per ac_code summary
      Object.entries(acCodeMap).forEach(([name, acRows]) => {
        groupedResult.push({
          // aC_CODE: aC_CODE,
          //name: `AC_CODE: ${name}`,
          name: name,
          diffamt: this.calculateTotalByKeyName(acRows, "diffamt"),
          brokamt: this.calculateTotalByKeyName(acRows, "brokamt"),
          billamt: this.calculateTotalByKeyName(acRows, "billamt"),
          ibrokshare: this.calculateTotalByKeyName(acRows, "ibrokshare"),
          sharerate: this.calculateTotalByKeyName(acRows, "sharerate"),
          shareamt: this.calculateTotalByKeyName(acRows, "shareamt"),
          netamt: this.calculateTotalByKeyName(acRows, "netamt"),
          isAccountSummary: true,
        });
      });

      // Party-level summary
      groupedResult.push({
        name: "Total",
        diffamt: this.calculateTotalByKeyName(fmlyItems, "diffamt"),
        brokamt: this.calculateTotalByKeyName(fmlyItems, "brokamt"),
        billamt: this.calculateTotalByKeyName(fmlyItems, "billamt"),
        ibrokshare: this.calculateTotalByKeyName(fmlyItems, "ibrokshare"),
        // sharerate: this.calculateTotalByKeyName(fmlyItems, "sharerate"),
        shareamt: this.calculateTotalByKeyName(fmlyItems, "shareamt"),
        netamt: this.calculateTotalByKeyName(fmlyItems, "netamt"),
        isGroupTotal: true,
      });
    });

    this.gridDataList = groupedResult;
  }




  onSubmit(event: any) {
    this.saverange();
    this.gridAPI.setGridOption('loading', true); // Show AG Grid loading overlay
    const body = { ...this.form.value };
    body.fromDate = format(body.fromDate, 'yyyy-MM-dd');
    body.toDate = format(body.toDate, 'yyyy-MM-dd');
    body.exId = idsStringArr(body.exId);
    body.account = idsStringArr(body.account);
    body.branchIds = idsStringArr(body.branchIds);

 
    

    this.reportServices.getBranchSharingReport(body).subscribe({
      next: (res) => {
        if (this.form.get('option')?.value === 'Summary') {
          this.groupBillSumDataSharing(res.data);
        } else {
          this.gridDataList = this.groupBillSumDataSharingDetail(res.data);
        }
      },
      error: (err) => {
        console.error('Error loading grid data', err);
      },
      complete: () => {
        setTimeout(() => {
          this.gridAPI.setGridOption('loading', false); // Hide loading overlay
        }, 300); // Small delay to make the loading visible
      }
    });
  }

  calculateTotalByKeyName(totalObj: any, key: string): number {
    if (key == 'sharerate') {
      for (const item of totalObj) {
        return item[key] || 0;
      }
    }
    let totalCredit = 0;
    for (const item of totalObj) {
      totalCredit += item[key] || 0;
    }
    return totalCredit;
  }

  netAmtWithArrowRenderer(params: any): string {
    const raw = params.value;
    const value = parseFloat(raw) || 0;

    if (value > 0) {
      return `<span class="arrow-icon up">▲ ${this.safeFormatCurrency(value)}</span>`;
    } else if (value < 0) {
      return `<span class="arrow-icon down">▼ ${this.safeFormatCurrency(value)}</span>`;
    } else {
      return '';
    }
  }
  safeFormatCurrency(value: any): string {
    const num = parseFloat(value);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }




  //groupBillSumDataSharing(data: any) {
  //  const gridGroupList: any = [];
  //  const uniqueGroupObj: any = {};
  //  let totalObj: any = [];
  //  data.forEach((obj: any, index: any) => {
  //    if (uniqueGroupObj[obj.fmlycode]){
  //      gridGroupList.push(obj);
  //      totalObj.push(obj);
  //    } else {
  //      if(totalObj.length){
  //        gridGroupList.push({
  //          name: "Party Total",
  //          billamt: this.calculateTotalByKeyName(totalObj, "billamt"),
  //          brokamt: this.calculateTotalByKeyName(totalObj, "brokamt"),
  //          totamt: this.calculateTotalByKeyName(totalObj, "totamt"),
  //          ibrokshare: this.calculateTotalByKeyName(totalObj, "ibrokshare"),
  //          sharerate: this.calculateTotalByKeyName(totalObj, "sharerate"),
  //          shareamt: this.calculateTotalByKeyName(totalObj, "shareamt"),
  //          netamt: this.calculateTotalByKeyName(totalObj, "netamt"),
  //          isGroupTotal: true,
  //        });
  //      }
  //      totalObj = [];
  //      gridGroupList.push({ singleAccount: obj.fmlycode }, obj);
  //      totalObj.push(obj);
  //      uniqueGroupObj[obj.fmlycode] = true;
  //    }
  //  });

  //  this.gridDataList = gridGroupList;
  //  console.log(this.gridDataList);
  //}

  initalApiCalls() {
    forkJoin([
      this.ddlService.getBranchDDL(),
      this.ddlService.getExchangeNameDLL(),
      this.ddlService.getAccountDDL(),
    ]).subscribe({
      next: (res) => {
        console.log(res);
        this.branchDDLList = res[0].data;
        this.exchangeDDLList = res[1].data;
        this.accountDDLList = res[2].data;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  public isFullWidthRow: (params: IsFullWidthRowParams) => boolean = (
    params: IsFullWidthRowParams
  ) => {
    return this.isFullWidth(params.rowNode.data);
  };
  public fullWidthCellRenderer: any = FullWidthCellRenderer;

  isFullWidth(data: any) {
    // return true when country is Peru, France or Italy
    return data.singleAccount;
  }
}
