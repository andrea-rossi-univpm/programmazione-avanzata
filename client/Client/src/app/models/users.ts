export class UsersModel {
  Email: string;
  Username: string;
  Role: 'User' | 'Administrator';
}

export class AddCreditContract {
  Email: string;
  CreditToAdd: number;
}

export class CredentialsModel {
  Email: string;
  Token: string;
}
