# Sales Management API Documentation

## Overview
The Sales Management module provides comprehensive functionality for managing sales operations including quotes, orders, deliveries, invoices, and returns.

## Authentication
All endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Sales Quotes (Devis)

### Get All Quotes
```
GET /api/commandevente/devis?page=1&pageSize=50
```

### Search Quotes
```
POST /api/commandevente/devis/search
```
Body:
```json
{
  "clientId": 1,
  "statut": "Brouillon",
  "dateDebut": "2023-01-01T00:00:00.000Z",
  "dateFin": "2023-12-31T23:59:59.999Z",
  "page": 1,
  "pageSize": 50,
  "sortBy": "DateCreation",
  "sortDirection": "Desc"
}
```

### Get Quote By ID
```
GET /api/commandevente/devis/{id}
```

### Create Quote
```
POST /api/commandevente/devis
```
Body:
```json
{
  "clientId": 1,
  "dateExpiration": "2023-12-31T23:59:59.999Z",
  "remise": 0,
  "lignes": [
    {
      "produitId": 1,
      "quantite": 5,
      "prixUnitaire": 100
    }
  ]
}
```

### Update Quote
```
PUT /api/commandevente/devis/{id}
```
Body:
```json
{
  "id": 1,
  "clientId": 1,
  "dateExpiration": "2023-12-31T23:59:59.999Z",
  "remise": 0,
  "lignes": [
    {
      "produitId": 1,
      "quantite": 5,
      "prixUnitaire": 100
    }
  ]
}
```

### Delete Quote
```
DELETE /api/commandevente/devis/{id}
```

### Submit Quote
```
POST /api/commandevente/devis/{devisId}/submit
```

### Accept Quote
```
POST /api/commandevente/devis/{devisId}/accept
```

## Sales Orders (CommandeVente)

### Get All Orders
```
GET /api/commandevente/commandes?page=1&pageSize=50
```

### Search Orders
```
POST /api/commandevente/commandes/search
```
Body:
```json
{
  "clientId": 1,
  "statut": "Brouillon",
  "dateDebut": "2023-01-01T00:00:00.000Z",
  "dateFin": "2023-12-31T23:59:59.999Z",
  "page": 1,
  "pageSize": 50,
  "sortBy": "DateCommande",
  "sortDirection": "Desc"
}
```

### Get Order By ID
```
GET /api/commandevente/commandes/{id}
```

### Create Order
```
POST /api/commandevente/commandes
```
Body:
```json
{
  "clientId": 1,
  "devisId": 1,
  "modeLivraison": "Standard",
  "conditionsPaiement": "30 jours",
  "lignes": [
    {
      "produitId": 1,
      "quantite": 5,
      "prixUnitaire": 100
    }
  ]
}
```

### Update Order
```
PUT /api/commandevente/commandes/{id}
```
Body:
```json
{
  "id": 1,
  "clientId": 1,
  "devisId": 1,
  "modeLivraison": "Standard",
  "conditionsPaiement": "30 jours",
  "lignes": [
    {
      "produitId": 1,
      "quantite": 5,
      "prixUnitaire": 100
    }
  ]
}
```

### Delete Order
```
DELETE /api/commandevente/commandes/{id}
```

### Submit Order
```
POST /api/commandevente/commandes/{commandeId}/submit
```

## Deliveries (Livraisons)

### Create Delivery
```
POST /api/commandevente/livraisons
```
Body:
```json
{
  "commandeId": 1,
  "dateLivraison": "2023-06-15T10:30:00.000Z",
  "transportateur": "DHL",
  "numeroSuivi": "DHL123456789",
  "lignes": [
    {
      "commandeLigneId": 1,
      "quantite": 5
    }
  ]
}
```

## Invoices (Factures)

### Create Invoice
```
POST /api/commandevente/factures
```
Body:
```json
{
  "commandeId": 1,
  "dateEcheance": "2023-07-15T23:59:59.999Z",
  "lignes": [
    {
      "commandeLigneId": 1,
      "quantite": 5,
      "prixUnitaire": 100
    }
  ]
}
```

## Returns (Retours)

### Create Return
```
POST /api/commandevente/retours
```
Body:
```json
{
  "factureId": 1,
  "motif": "Produit défectueux",
  "lignes": [
    {
      "factureLigneId": 1,
      "quantite": 2
    }
  ]
}
```

## Roles and Permissions

- **Admin**: Full access to all sales operations
- **Vendeur**: Access to create, update, and manage sales quotes and orders
- **StockManager**: Access to manage deliveries

## Error Handling

All API responses follow a standard format:
```json
{
  "success": true,
  "message": "OK",
  "data": {},
  "timestamp": "2023-06-15T10:30:00.000Z"
}
```

In case of errors:
```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "timestamp": "2023-06-15T10:30:00.000Z"
}
```