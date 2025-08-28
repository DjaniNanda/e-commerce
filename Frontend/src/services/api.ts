const API_BASE_URL = import.meta.env.VITE_API_URL ;

// Configuration axios-like pour les requêtes
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      // Only set Content-Type for JSON requests
      // For FormData, let the browser set it automatically
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const api = {
  // GET request
  get: (endpoint: string) => apiRequest(endpoint, { method: 'GET' }),
  
  // POST request (JSON)
  post: (endpoint: string, data: any) =>
    apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  // POST request (FormData) - for file uploads
  postFormData: (endpoint: string, formData: FormData) =>
    apiRequest(endpoint, {
      method: 'POST',
      body: formData,
    }),
  
  // PUT request
  put: (endpoint: string, data: any) =>
    apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  // PUT request (FormData)
  putFormData: (endpoint: string, formData: FormData) =>
    apiRequest(endpoint, {
      method: 'PUT',
      body: formData,
    }),
  
  // DELETE request
  delete: (endpoint: string) => apiRequest(endpoint, { method: 'DELETE' }),
};