import { Component } from "@angular/core";
import { ICellRendererParams } from "@ag-grid-community/core";
import { ICellRendererAngularComp } from "@ag-grid-community/angular";

@Component({
    template: `
        <div class="full-width-panel group-header">
            {{params.data.singleAccount}}
        </div>
    `
})
export class FullWidthCellRenderer implements ICellRendererAngularComp {
    params!: ICellRendererParams

    agInit(params: ICellRendererParams): void {
        console.log(params);
        this.params = params
    }

    refresh(params: ICellRendererParams) {
        console.log(params);
        return false;
    }
}
