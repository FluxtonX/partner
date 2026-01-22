// Stub file - base44 APIs removed, running locally only
// TODO: Replace with actual backend API when ready

// Stub integrations - return empty objects/methods for local development
export const Core = {
  InvokeLLM: async () => null,
  SendEmail: async () => null,
  UploadFile: async () => null,
  GenerateImage: async () => null,
  ExtractDataFromUploadedFile: async () => null,
  CreateFileSignedUrl: async () => null,
  UploadPrivateFile: async () => null,
};

export const InvokeLLM = async () => null;
export const SendEmail = async () => null;
export const UploadFile = async () => null;
export const GenerateImage = async () => null;
export const ExtractDataFromUploadedFile = async () => null;
export const CreateFileSignedUrl = async () => null;
export const UploadPrivateFile = async () => null;

// Re-export entities needed by components
export { 
  BusinessSettings, 
  Project, 
  Client, 
  ProductOrService, 
  Invoice 
} from './entities';

