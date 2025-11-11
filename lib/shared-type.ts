export type CreateCustomer = {
  firstName: string,
  lastName: string,
  email: string,
  address?: string | null,
  mobilePhone?: string | null,
  dateOfBirth?: string | null,
  emergencyContact?: string | null,
}
