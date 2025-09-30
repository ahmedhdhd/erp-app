import { Injectable } from '@angular/core';
import { SalesOrderResponse, QuoteResponse, CompanySettingsResponse } from '../models/sales.models';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  constructor() {
    // Initialize pdfMake fonts
    try {
      if (pdfFonts) {
        (pdfMake as any).vfs = pdfFonts;
      }
    } catch (e) {
      console.warn('Could not initialize pdfMake fonts', e);
    }
  }

  /**
   * Generate and download PDF for a sales order
   */
  generateSalesOrderInvoice(order: SalesOrderResponse, companySettings: CompanySettingsResponse | null): void {
    try {
      const docDefinition = this.createSalesOrderDocDefinition(order, companySettings);
      const pdfDoc = pdfMake.createPdf(docDefinition);
      
      // Open PDF in a new window/tab
      pdfDoc.open();
    } catch (error) {
      console.error('Error generating sales order PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  /**
   * Generate and download PDF for a quote
   */
  generateQuoteInvoice(quote: QuoteResponse, companySettings: CompanySettingsResponse | null): void {
    try {
      const docDefinition = this.createQuoteDocDefinition(quote, companySettings);
      const pdfDoc = pdfMake.createPdf(docDefinition);
      
      // Open PDF in a new window/tab
      pdfDoc.open();
    } catch (error) {
      console.error('Error generating quote PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  /**
   * Create document definition for sales order
   */
  private createSalesOrderDocDefinition(order: SalesOrderResponse, companySettings: CompanySettingsResponse | null): any {
    return {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        // Header
        {
          columns: [
            {
              text: 'INVOICE',
              style: 'header'
            },
            {
              text: `Order #${order.id}`,
              style: 'subheader',
              alignment: 'right'
            }
          ]
        },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 } as any
          ]
        },
        { text: ' ', margin: [0, 10] },
        
        // Company and Client Information
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: 'FROM:', style: 'subheader' },
                { text: companySettings?.nomSociete || 'Your Company Name' },
                { text: companySettings?.adresse || 'Company Address' },
                { text: `${companySettings?.email ? `Email: ${companySettings.email}` : ''}` },
                { text: `${companySettings?.telephone ? `Phone: ${companySettings.telephone}` : ''}` }
              ]
            },
            {
              width: '*',
              stack: [
                { text: 'TO:', style: 'subheader' },
                { text: order.client.raisonSociale || `${order.client.nom} ${order.client.prenom}` },
                { text: order.client.adresse || '' },
                { text: `${order.client.ville || ''}, ${order.client.pays || ''}` },
                { text: `Email: ${order.client.email || ''}` },
                { text: `Phone: ${order.client.telephone || ''}` }
              ]
            }
          ]
        },
        { text: ' ', margin: [0, 20] },
        
        // Order Information
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: 'Order Date:', bold: true },
                { text: this.formatDate(order.dateCommande) }
              ]
            },
            {
              width: '*',
              stack: [
                { text: 'Status:', bold: true },
                { text: order.statut }
              ]
            }
          ]
        },
        { text: ' ', margin: [0, 20] },
        
        // Items Table
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Item', style: 'tableHeader' },
                { text: 'Quantity', style: 'tableHeader' },
                { text: 'Unit Price', style: 'tableHeader' },
                { text: 'Total', style: 'tableHeader' }
              ],
              ...order.lignes.map(line => [
                `${line.produit.designation || ''}\n${line.produit.reference || ''}`,
                line.quantite.toString(),
                this.formatCurrency(line.prixUnitaireHT),
                this.formatCurrency(line.totalLigne)
              ]),
              [
                { text: 'Total HT', colSpan: 3, alignment: 'right' },
                {},
                {},
                { text: this.formatCurrency(order.montantHT), bold: true }
              ],
              [
                { text: 'VAT', colSpan: 3, alignment: 'right' },
                {},
                {},
                { text: this.formatCurrency(order.montantTTC - order.montantHT), bold: true }
              ],
              [
                { text: 'Total TTC', colSpan: 3, alignment: 'right' },
                {},
                {},
                { text: this.formatCurrency(order.montantTTC), bold: true }
              ]
            ].flat()
          }
        },
        { text: ' ', margin: [0, 20] },
        
        // Footer
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              stack: [
                { text: 'Thank you for your business!', alignment: 'center', margin: [0, 20] },
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 } as any] },
                { text: 'Signature', alignment: 'center' }
              ]
            },
            { width: '*', text: '' }
          ]
        }
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        fontSize: 10
      }
    };
  }

  /**
   * Create document definition for quote
   */
  private createQuoteDocDefinition(quote: QuoteResponse, companySettings: CompanySettingsResponse | null): any {
    return {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        // Header
        {
          columns: [
            {
              text: 'QUOTE',
              style: 'header'
            },
            {
              text: `Quote #${quote.id}`,
              style: 'subheader',
              alignment: 'right'
            }
          ]
        },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 } as any
          ]
        },
        { text: ' ', margin: [0, 10] },
        
        // Company and Client Information
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: 'FROM:', style: 'subheader' },
                { text: companySettings?.nomSociete || 'Your Company Name' },
                { text: companySettings?.adresse || 'Company Address' },
                { text: `${companySettings?.email ? `Email: ${companySettings.email}` : ''}` },
                { text: `${companySettings?.telephone ? `Phone: ${companySettings.telephone}` : ''}` }
              ]
            },
            {
              width: '*',
              stack: [
                { text: 'TO:', style: 'subheader' },
                { text: quote.client.raisonSociale || `${quote.client.nom} ${quote.client.prenom}` },
                { text: quote.client.adresse || '' },
                { text: `${quote.client.ville || ''}, ${quote.client.pays || ''}` },
                { text: `Email: ${quote.client.email || ''}` },
                { text: `Phone: ${quote.client.telephone || ''}` }
              ]
            }
          ]
        },
        { text: ' ', margin: [0, 20] },
        
        // Quote Information
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: 'Quote Date:', bold: true },
                { text: this.formatDate(quote.dateCreation) }
              ]
            },
            {
              width: '*',
              stack: [
                { text: 'Expiration Date:', bold: true },
                { text: this.formatDate(quote.dateExpiration) }
              ]
            },
            {
              width: '*',
              stack: [
                { text: 'Status:', bold: true },
                { text: quote.statut }
              ]
            }
          ]
        },
        { text: ' ', margin: [0, 20] },
        
        // Items Table
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Item', style: 'tableHeader' },
                { text: 'Quantity', style: 'tableHeader' },
                { text: 'Unit Price', style: 'tableHeader' },
                { text: 'Total', style: 'tableHeader' }
              ],
              ...quote.lignes.map(line => [
                `${line.produit.designation || ''}\n${line.produit.reference || ''}`,
                line.quantite.toString(),
                this.formatCurrency(line.prixUnitaireHT),
                this.formatCurrency(line.totalLigne)
              ]),
              [
                { text: 'Total HT', colSpan: 3, alignment: 'right' },
                {},
                {},
                { text: this.formatCurrency(quote.montantHT), bold: true }
              ],
              [
                { text: 'VAT', colSpan: 3, alignment: 'right' },
                {},
                {},
                { text: this.formatCurrency(quote.montantTTC - quote.montantHT), bold: true }
              ],
              [
                { text: 'Total TTC', colSpan: 3, alignment: 'right' },
                {},
                {},
                { text: this.formatCurrency(quote.montantTTC), bold: true }
              ]
            ].flat()
          }
        },
        { text: ' ', margin: [0, 20] },
        
        // Footer
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              stack: [
                { text: 'Thank you for your business!', alignment: 'center', margin: [0, 20] },
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 } as any] },
                { text: 'Signature', alignment: 'center' }
              ]
            },
            { width: '*', text: '' }
          ]
        }
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        fontSize: 10
      }
    };
  }

  /**
   * Format date for display
   */
  private formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  /**
   * Format currency for display
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(amount);
  }
}