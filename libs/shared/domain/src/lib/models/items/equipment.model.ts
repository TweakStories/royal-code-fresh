// Equipment Needed Interface
export interface Equipment {
    id: string;
    type: 'Tools' | 'Vehicles' | 'Clothing' | 'Electronics' | 'Safety Gear';
    list: EquipmentItem[];
  }

  export interface EquipmentItem {
    id: string;
    equipmentId: string;
    name: string;
    description?: string;
    iconName?: string;
  }
