import { Injectable } from '@angular/core';
import { SalesOrderResponse, QuoteResponse, CompanySettingsResponse } from '../models/sales.models';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize pdfMake fonts
(pdfMake as any).vfs = pdfFonts.vfs;

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  constructor() {
    // Constructor is now empty as pdfMake is initialized above
  }

  /**
   * Generate and download PDF for a sales order
   */
  generateSalesOrderInvoice(order: SalesOrderResponse, companySettings: CompanySettingsResponse | null): void {
    try {
      const docDefinition = this.generateSalesOrderDocDefinition(order, companySettings);
      pdfMake.createPdf(docDefinition).download(`facture-${order.id}.pdf`);
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
      const docDefinition = this.generateQuoteDocDefinition(quote, companySettings);
      pdfMake.createPdf(docDefinition).download(`devis-${quote.id}.pdf`);
    } catch (error) {
      console.error('Error generating quote PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  /**
   * Create document definition for sales order PDF
   */
  private generateSalesOrderDocDefinition(order: SalesOrderResponse, companySettings: CompanySettingsResponse | null): any {
    console.log('Generating sales order PDF with company settings:', companySettings); // Debug log
    
    // Format dates
    const orderDate = new Date(order.dateCommande).toLocaleDateString('fr-FR');
    
    // Format invoice number with leading zeros (5 digits)
    const invoiceNumber = order.id.toString().padStart(5, '0');
    
    // Generate table rows for order lines
    const lineItems = order.lignes.map(line => [
      line.produit.designation || '',
      line.quantite.toString(),
      line.prixUnitaireHT.toFixed(3),
      line.totalLigne.toFixed(3),
      line.tauxTVA + '%'
    ]);

    // Calculate totals
    const htAmount = order.montantHT;
    const vatAmount = order.montantTTC - order.montantHT;
    const ttcAmount = order.montantTTC;

    // Convert TTC amount to words in French
    const ttcInWords = this.convertNumberToWords(ttcAmount);

    // Prepare company header content - filter out empty items
    const companyHeaderContent = [
      { text: companySettings?.nomSociete || 'Nom de l\'entreprise', style: 'header' },
      companySettings?.adresse ? { text: companySettings.adresse } : null,
      companySettings?.telephone ? { text: 'Tél: ' + companySettings.telephone } : null,
      companySettings?.rc ? { text: 'RC: ' + companySettings.rc } : null,
      companySettings?.mf ? { text: 'MF: ' + companySettings.mf } : null,
      companySettings?.rib ? { text: 'RIB: ' + companySettings.rib } : null,
      companySettings?.email ? { text: 'Email: ' + companySettings.email } : null
    ].filter(item => item !== null) as { text: string; style?: string }[];

    console.log('Company header content:', companyHeaderContent); // Debug log

    // Check if logo exists and is valid
    const hasValidLogo = companySettings?.logo && companySettings.logo.startsWith('data:image');

    return {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        // Header with company info and logo
        {
          columns: [
            {
              width: hasValidLogo ? '*' : '100%',
              stack: companyHeaderContent
            },
            hasValidLogo ? {
              width: 'auto',
              image: companySettings!.logo,
              fit: [100, 80],
              alignment: 'right'
            } : {}
          ]
        },
        { text: '\n' },
        // Invoice info boxes
        {
          columns: [
            {
              width: '45%',
              stack: [
                { text: 'Facture', style: 'subheader', alignment: 'center' },
                { text: '\n' },
                { text: 'Numéro: ' + invoiceNumber },
                { text: 'Date: ' + orderDate }
              ],
              style: 'infobox'
            },
            { width: '*', text: '' },
            {
              width: '45%',
              stack: [
                { text: 'Client', style: 'subheader', alignment: 'center' },
                { text: '\n' },
                { text: order.client.raisonSociale || `${order.client.nom} ${order.client.prenom}`, bold: true },
                order.client.adresse ? { text: order.client.adresse } : {},
                order.client.ice ? { text: 'MF: ' + order.client.ice } : {}
              ],
              style: 'infobox'
            }
          ]
        },
        { text: '\n' },
        // Items table
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Désignation', style: 'tableHeader' },
                { text: 'Qté', style: 'tableHeader', alignment: 'right' },
                { text: 'PU HT', style: 'tableHeader', alignment: 'right' },
                { text: 'Total HT', style: 'tableHeader', alignment: 'right' },
                { text: 'TVA %', style: 'tableHeader', alignment: 'right' }
              ],
              ...lineItems
            ]
          }
        },
        { text: '\n' },
        // Totals section with proper border box
        {
          stack: [
            {
              table: {
                widths: ['*', 'auto'],
                body: [
                  [
                    { text: 'Total HT:', bold: true },
                    { text: htAmount.toFixed(3) + ' TND', alignment: 'right' }
                  ],
                  [
                    { text: 'TVA:', bold: true },
                    { text: vatAmount.toFixed(3) + ' TND', alignment: 'right' }
                  ],
                  [
                    { text: 'Total TTC:', bold: true },
                    { text: ttcAmount.toFixed(3) + ' TND', alignment: 'right', bold: true }
                  ]
                ]
              },
              layout: 'noBorders'
            }
          ],
          style: 'borderedbox'
        },
        { text: '\n' },
        // Amount in words section
        {
          text: 'Arrêtée la présente facture à la somme de:',
          bold: true
        },
        { text: '\n' },
        {
          columns: [
            {
              width: '70%',
              text: ttcInWords + ' TTC',
              style: 'borderedbox'
            },
            {
              width: '5%',
              text: ''
            },
            {
              width: '25%',
              text: 'Cachet et signature',
              style: 'borderedbox',
              alignment: 'center'
            }
          ]
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 14,
          bold: true
        },
        infobox: {
          border: [1, 1, 1, 1],
          borderColor: '#000'
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          fillColor: '#eeeeee'
        },
        borderedbox: {
          border: [1, 1, 1, 1],
          borderColor: '#000',
          margin: [0, 5, 0, 5],
          padding: [10, 10, 10, 10]
        }
      },
      defaultStyle: {
        fontSize: 10
      }
    };
  }

  /**
   * Create document definition for quote PDF
   */
  private generateQuoteDocDefinition(quote: QuoteResponse, companySettings: CompanySettingsResponse | null): any {
    console.log('Generating quote PDF with company settings:', companySettings); // Debug log
    
    // Format dates
    const creationDate = new Date(quote.dateCreation).toLocaleDateString('fr-FR');
    const expirationDate = new Date(quote.dateExpiration).toLocaleDateString('fr-FR');
    
    // Format quote number with leading zeros (5 digits)
    const quoteNumber = quote.id.toString().padStart(5, '0');
    
    // Generate table rows for quote lines
    const lineItems = quote.lignes.map(line => [
      line.produit.designation || '',
      line.quantite.toString(),
      line.prixUnitaireHT.toFixed(3),
      line.totalLigne.toFixed(3),
      line.tauxTVA + '%'
    ]);

    // Calculate totals
    const htAmount = quote.montantHT;
    const vatAmount = quote.montantTTC - quote.montantHT;
    const ttcAmount = quote.montantTTC;

    // Convert TTC amount to words in French
    const ttcInWords = this.convertNumberToWords(ttcAmount);

    // Prepare company header content - filter out empty items
    const companyHeaderContent = [
      { text: companySettings?.nomSociete || 'Nom de l\'entreprise', style: 'header' }, // This is the line that shows "Nom de l'entreprise"
      companySettings?.adresse ? { text: companySettings.adresse } : null,
      companySettings?.telephone ? { text: 'Tél: ' + companySettings.telephone } : null,
      companySettings?.rc ? { text: 'RC: ' + companySettings.rc } : null,
      companySettings?.mf ? { text: 'MF: ' + companySettings.mf } : null,
      companySettings?.rib ? { text: 'RIB: ' + companySettings.rib } : null,
      companySettings?.email ? { text: 'Email: ' + companySettings.email } : null
    ].filter(item => item !== null) as { text: string; style?: string }[];

    console.log('Company header content for quote:', companyHeaderContent); // Debug log

    // Check if logo exists and is valid
    const hasValidLogo = companySettings?.logo && companySettings.logo.startsWith('data:image');

    return {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        // Header with company info and logo
        {
          columns: [
            {
              width: hasValidLogo ? '*' : '100%',
              stack: companyHeaderContent
            },
            hasValidLogo ? {
              width: 'auto',
              image: companySettings!.logo,
              fit: [100, 80],
              alignment: 'right'
            } : {}
          ]
        },
        { text: '\n' },
        // Quote info boxes
        {
          columns: [
            {
              width: '45%',
              stack: [
                { text: 'Devis', style: 'subheader', alignment: 'center' },
                { text: '\n' },
                { text: 'Numéro: ' + quoteNumber },
                { text: 'Date: ' + creationDate },
                { text: 'Date d\'expiration: ' + expirationDate }
              ],
              style: 'infobox'
            },
            { width: '*', text: '' },
            {
              width: '45%',
              stack: [
                { text: 'Client', style: 'subheader', alignment: 'center' },
                { text: '\n' },
                { text: quote.client.raisonSociale || `${quote.client.nom} ${quote.client.prenom}`, bold: true },
                quote.client.adresse ? { text: quote.client.adresse } : {},
                quote.client.ice ? { text: 'MF: ' + quote.client.ice } : {}
              ],
              style: 'infobox'
            }
          ]
        },
        { text: '\n' },
        // Items table
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Désignation', style: 'tableHeader' },
                { text: 'Qté', style: 'tableHeader', alignment: 'right' },
                { text: 'PU HT', style: 'tableHeader', alignment: 'right' },
                { text: 'Total HT', style: 'tableHeader', alignment: 'right' },
                { text: 'TVA %', style: 'tableHeader', alignment: 'right' }
              ],
              ...lineItems
            ]
          }
        },
        { text: '\n' },
        // Totals section with proper border box
        {
          stack: [
            {
              table: {
                widths: ['*', 'auto'],
                body: [
                  [
                    { text: 'Total HT:', bold: true },
                    { text: htAmount.toFixed(3) + ' TND', alignment: 'right' }
                  ],
                  [
                    { text: 'TVA:', bold: true },
                    { text: vatAmount.toFixed(3) + ' TND', alignment: 'right' }
                  ],
                  [
                    { text: 'Total TTC:', bold: true },
                    { text: ttcAmount.toFixed(3) + ' TND', alignment: 'right', bold: true }
                  ]
                ]
              },
              layout: 'noBorders'
            }
          ],
          style: 'borderedbox'
        },
        { text: '\n' },
        // Amount in words section
        {
          text: 'Arrêtée la présente facture à la somme de:',
          bold: true
        },
        { text: '\n' },
        {
          columns: [
            {
              width: '70%',
              text: ttcInWords + ' TTC',
              style: 'borderedbox'
            },
            {
              width: '5%',
              text: ''
            },
            {
              width: '25%',
              text: 'Cachet et signature',
              style: 'borderedbox',
              alignment: 'center'
            }
          ]
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 14,
          bold: true
        },
        infobox: {
          border: [1, 1, 1, 1],
          borderColor: '#000'
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          fillColor: '#eeeeee'
        },
        borderedbox: {
          border: [1, 1, 1, 1],
          borderColor: '#000',
          margin: [0, 5, 0, 5],
          padding: [10, 10, 10, 10]
        }
      },
      defaultStyle: {
        fontSize: 10
      }
    };
  }

  /**
   * Convert number to words in French
   */
  private convertNumberToWords(num: number): string {
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
    
    if (num === 0) return 'zéro';
    
    // Separate integer and decimal parts
    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 1000); // 3 decimal places
    
    let result = '';
    
    if (integerPart === 0) {
      result = 'zéro';
    } else {
      result = this.convertIntegerToWords(integerPart);
    }
    
    // Add decimal part if exists
    if (decimalPart > 0) {
      result += ' virgule ' + this.convertIntegerToWords(decimalPart);
    }
    
    return result + ' dinars tunisiens';
  }
  
  private convertIntegerToWords(num: number): string {
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
    
    if (num === 0) return '';
    
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      const ten = Math.floor(num / 10);
      const unit = num % 10;
      if (unit === 0) return tens[ten];
      if (ten === 7 || ten === 9) return tens[ten] + '-' + this.convertIntegerToWords(unit + 10);
      return tens[ten] + (unit === 1 ? '-et-un' : '-' + units[unit]);
    }
    if (num < 1000) {
      const hundred = Math.floor(num / 100);
      const remainder = num % 100;
      if (hundred === 1) return 'cent' + (remainder === 0 ? '' : ' ' + this.convertIntegerToWords(remainder));
      return units[hundred] + ' cent' + (remainder === 0 ? 's' : ' ' + this.convertIntegerToWords(remainder));
    }
    if (num < 1000000) {
      const thousand = Math.floor(num / 1000);
      const remainder = num % 1000;
      if (thousand === 1) return 'mille' + (remainder === 0 ? '' : ' ' + this.convertIntegerToWords(remainder));
      return this.convertIntegerToWords(thousand) + ' mille' + (remainder === 0 ? '' : ' ' + this.convertIntegerToWords(remainder));
    }
    if (num < 1000000000) {
      const million = Math.floor(num / 1000000);
      const remainder = num % 1000000;
      if (million === 1) return 'un million' + (remainder === 0 ? '' : ' ' + this.convertIntegerToWords(remainder));
      return this.convertIntegerToWords(million) + ' millions' + (remainder === 0 ? '' : ' ' + this.convertIntegerToWords(remainder));
    }
    return '';
  }
}
