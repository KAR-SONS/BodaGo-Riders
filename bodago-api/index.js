import express from 'express'
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY

// ─── Initialize Payment ───────────────────────────────────
app.post('/api/payment/initialize', async (req, res) => {
  const { email, name } = req.body

  if (!email) return res.status(400).json({ error: 'Email required' })

  try {
    const { data } = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: 10000, // Paystack uses kobo/cents — 10000 = Ksh 100
        currency: 'KES',
        metadata: { name, email },
        callback_url: `${req.headers.origin}/dashboard`,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    )

    res.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    })

  } catch (err) {
    console.error(err?.response?.data || err.message)
    res.status(500).json({ error: 'Failed to initialize payment' })
  }
})

// ─── Verify Payment ───────────────────────────────────────
app.get('/api/payment/verify/:reference', async (req, res) => {
  const { reference } = req.params

  try {
    const { data } = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
      }
    )

    const transaction = data.data

    if (transaction.status !== 'success') {
      return res.json({ success: false, message: 'Payment not successful' })
    }

    const email = transaction.metadata.email

    // Log payment
    await supabase.from('payments').insert({
      rider_email: email,
      amount: 100,
      mpesa_receipt: transaction.reference,
      status: 'success',
    })

    // Extend subscription 30 days
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await supabase
      .from('riders')
      .update({
        subscription_status: 'active',
        subscription_expires_at: expiresAt.toISOString(),
      })
      .eq('email', email)

    await supabase
      .from('riders_approval')
      .update({
        subscription_status: 'active',
        subscription_expires_at: expiresAt.toISOString(),
      })
      .eq('email', email)

    res.json({ success: true })

  } catch (err) {
    console.error(err?.response?.data || err.message)
    res.status(500).json({ error: 'Verification failed' })
  }
})

app.listen(process.env.PORT, () => {
  console.log(`BodaGo API running on port ${process.env.PORT}`)
})