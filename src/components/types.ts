export type UserOption = {
  id: string;
  name: string;
  email: string;
  role: string | null;
};

export type ClientOption = {
  id: number;
  name: string;
};

export type ContractItem = {
  archived: boolean | null;
  assigneeId: string;
  bd: { id: string; image: string | null; name: string | null } | null;
  clientId: number | null;
  client: { id: number | null; name: string | null } | null;
  createdAt: Date | null;
  description: string | null;
  endDate: string | null;
  id: number;
  pdfLink: string | null;
  referenceNumber: string | null;
  rm: { id: string; image: string | null; name: string | null } | null;
  rmId: string | null;
  signedDate: string | null;
  startDate: string | null;
  status: string | null;
  title: string;
  updatedAt: Date | null;
};

export type ContractFormValues = {
  title: string;
  description: string;
  clientId: number | null;
  assigneeId: string | null;
  rmId: string | null;
  startDate: string;
  endDate: string;
  signedDate: string;
  pdfLink: string;
  referenceNumber: string;
  status: "active" | "inactive";
};
