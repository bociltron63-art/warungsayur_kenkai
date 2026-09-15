import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// productService: single access point for the product master + config.
export const productService = {
  async getConfig() {
    const { data } = await axios.get(`${API}/config`);
    return data;
  },
  async getProducts() {
    const { data } = await axios.get(`${API}/products`);
    return data;
  },
  async getProduct(id) {
    const { data } = await axios.get(`${API}/products/${id}`);
    return data;
  },
  async getOrderNumber() {
    const { data } = await axios.post(`${API}/order-number`);
    return data.order_number;
  },
};

export { API };
