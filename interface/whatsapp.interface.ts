export interface WhatsAppReqObject {
    object: string;
    entry: Entry[];
  }
  
   interface Entry {
    id: string;
    changes: Change[];
  }
  
   interface Change {
    value: Value;
    field: string;
  }
  
   interface Value {
    messaging_product: string;
    metadata: Metadata;
    contacts: Contact[];
    messages: Message[];
  }
  
   interface Metadata {
    display_phone_number: string;
    phone_number_id: string;
  }
  
   interface Contact {
    profile: Profile;
    wa_id: string;
  }
  
   interface Profile {
    name: string;
  }
  
   interface Message {
    from: string;
    id: string;
    timestamp: string;
    text: Text;
    type: string;
  }
  
   interface Text {
    body: string;
  }
  