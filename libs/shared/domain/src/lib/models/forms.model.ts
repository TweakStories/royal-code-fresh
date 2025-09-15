import { Address } from "./locations/address.model";

export interface SelectOption {
  value: any;
  label: string;
}

export interface AddressSubmitEvent {
  address: Address;
  shouldSave: boolean;
}

export interface AddressFormData {
  address?: Address;
  showSaveAddressToggle?: boolean; 
  isLoggedIn?: boolean;
}

export interface AddressFormOverlayResult {
  address: Address;
  shouldSave: boolean;
}
