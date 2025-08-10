type ddlObject = {
    id: number;
    name: string;
}

export const idsStringArr = (arr:ddlObject[]) => {
    if(arr?.length == 0){
        return '';
    }
    return arr
  .filter(item => item.id !== 0 && item.id !== -1)
  .map(item => item.id)
  .join(',');
}
