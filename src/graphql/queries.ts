import { gql } from "@apollo/client";

export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(input: { email: $email, password: $password }) {
      accessToken
    }
  }
`;

export const GET_TABLES = gql`
  query GetTables($id: ID!) {
    business(id: $id) {
      floors {
        id
        name
        tables {
          id
          name
          status
          capacity
          shape
        }
      }
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts($businessId: ID!) {
    products(businessId: $businessId) {
      id
      name
      price
      description
      category
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      orders {
       id
      status
      total
      }
    }
  }
`;
