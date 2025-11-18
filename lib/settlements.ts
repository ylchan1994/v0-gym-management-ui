'use server'
import { getEzypayToken } from "./passer-functions"

const apiEndpoint = `${process.env.API_ENDPOINT}/v2/billing/settlements`
const fileEndpoint = `${process.env.API_ENDPOINT}/v2/files`
const merchantId = process.env.EZYPAY_MERCHANT_ID

export type Settlement = {
  id: string,
  date: string,
  amount: string,
  status: string,
}

export type SettlementList = Settlement[]

export type documentType = 'tax_invoice' | 'detail_report' | 'summary_report'

function normalisedEzypaySettlement(settlements) {
  const normalisedSettlements: SettlementList = settlements.map(settlement =>( {
    id: settlement.number,
    date: settlement.date,
    amount: '$' + settlement.amount.value,
    status: settlement.status
  }))

  return normalisedSettlements.filter(settlement => settlement.amount != '$0' && settlement.amount != '$0.00')
}

export async function downloadDocument(settlementId, documentType): Promise<any> {
  try {    
    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken()
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(`Generate file failed: No access_token from token utility`)
    }   

    const body = {documentType: documentType}

    const response = await fetch(`${apiEndpoint}/${settlementId}/file`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        merchant: merchantId ,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("Created settlement file failed:", response.status, text)
      throw new Error(`Create settlement file failed: ${response.status}`)
    }

    const settlementDoc = await response.json()    

    const fileId = settlementDoc.fileId

    const getFile = await fetch(`${fileEndpoint}/${fileId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        merchant: merchantId ,
      },
    })

    if (!getFile.ok) {
      const text = await response.text()
      console.error("Download settlement file failed:", response.status, text)
      throw new Error(`Download settlement file failed: ${response.status}`)
    }

    const fileData = await getFile.json()

    const downloadUrl = fileData.url

    return downloadUrl
  } catch (err) {
    console.error("Download settlement file error:", err)
    throw err
  }
}

export async function listSettlements(): Promise<any> {
  try {      
    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken()
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(`List settlement failed: No access_token from token utility`)
    }    

    const response = await fetch(`${apiEndpoint}?limit=100`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        merchant: merchantId ,
      },
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("List settlement failed:", response.status, text)
      throw new Error(`List settlement failed: ${response.status}`)
    }
    
    const settlements = await response.json()  
    console.log(settlements)
    return normalisedEzypaySettlement(settlements.data)
  } catch (err) {
    console.error("List settlement error:", err)
    throw err
  }
}