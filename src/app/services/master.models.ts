export interface ClientMasterRequest {
  action: string;
  id: number;
  login: number;
  managerId: number;
  brokerId: number;
  exId: number;
  brokShare: number;
  managerShare: number;
  currency: string;
  commission: number;
  createdBy: number;
}

export interface LoginClientInfo {
  login: number;
  userName: string;
  clientId: number | null;
  managerName: string;
  brokerName: string;
  exchange: string;
  brokShare: number | null;
  managerShare: number | null;
  currency: string;
  commission: number | null;
  createdDate: string | null;
}
