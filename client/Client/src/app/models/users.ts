export class UsersModel {
  Email: string;
  Username: string;
  Role: 'User' | 'Administrator';
}

export class AddCreditContract {
  Email: string;
  CreditToAdd: number;
}
