import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import Papa from "papaparse"

export const exportToPdf = (headers: string[], data: any[][], title: string) => {
  console.log("[EXPORT] Gerando PDF:", title)
  try {
    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text(title, 14, 16)

    doc.setFontSize(10)
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 24)

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 30,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    })

    const fileName = `${title.toLowerCase().replace(/ /g, "_")}_${Date.now()}.pdf`
    doc.save(fileName)
    console.log("[EXPORT SUCCESS] PDF gerado:", fileName)
  } catch (error) {
    console.error("[EXPORT ERROR] Erro ao gerar PDF:", error)
    throw error
  }
}

export const exportToCsv = (data: any[], fileName: string) => {
  console.log("[EXPORT] Gerando CSV:", fileName)
  try {
    const csv = Papa.unparse(data)
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `${fileName}_${Date.now()}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      console.log("[EXPORT SUCCESS] CSV gerado:", fileName)
    }
  } catch (error) {
    console.error("[EXPORT ERROR] Erro ao gerar CSV:", error)
    throw error
  }
}

export const exportToExcel = (data: any[], fileName: string) => {
  console.log("[EXPORT] Gerando Excel (CSV):", fileName)
  exportToCsv(data, fileName)
}

export const generateReceipt = (saleData: any, saleId: string) => {
  console.log("[RECEIPT] Gerando cupom não fiscal para venda:", saleId)
  try {
    const receiptContent = `
      <html>
        <head>
          <title>Cupom Não Fiscal</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              width: 300px;
              margin: 20px auto;
              padding: 10px;
            }
            h2, h3 {
              text-align: center;
              margin: 10px 0;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }
            .item {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .total {
              font-weight: bold;
              font-size: 14px;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 10px;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h2>CUPOM NÃO FISCAL</h2>
          <div class="divider"></div>
          <p><strong>ID da Venda:</strong> ${saleId.substring(0, 8).toUpperCase()}</p>
          <p><strong>Data:</strong> ${new Date().toLocaleString("pt-BR")}</p>
          <div class="divider"></div>
          <h3>Itens Comprados</h3>
          ${saleData.items
            .map(
              (item: any) => `
            <div class="item">
              <span>${item.name}</span>
              <span>R$ ${item.price.toFixed(2)}</span>
            </div>
            <div class="item" style="font-size: 10px; color: #666;">
              <span>${item.quantity} x R$ ${item.price.toFixed(2)}</span>
              <span>R$ ${(item.quantity * item.price).toFixed(2)}</span>
            </div>
          `
            )
            .join("")}
          <div class="divider"></div>
          <div class="item total">
            <span>TOTAL</span>
            <span>R$ ${saleData.total.toFixed(2)}</span>
          </div>
          <div class="divider"></div>
          <p><strong>Forma de Pagamento:</strong> ${saleData.paymentMethod}</p>
          <div class="footer">
            <p>** DOCUMENTO SEM VALOR FISCAL **</p>
            <p>Obrigado pela preferência!</p>
          </div>
        </body>
      </html>
    `

    const receiptWindow = window.open("", "PRINT", "height=600,width=400")
    if (receiptWindow) {
      receiptWindow.document.write(receiptContent)
      receiptWindow.document.close()
      receiptWindow.focus()

      setTimeout(() => {
        receiptWindow.print()
      }, 250)

      console.log("[RECEIPT SUCCESS] Cupom gerado com sucesso")
    }
  } catch (error) {
    console.error("[RECEIPT ERROR] Erro ao gerar cupom:", error)
    throw error
  }
}
