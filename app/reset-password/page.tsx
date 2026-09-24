'use client'

import { FormEvent, useEffect, useState } from 'react'
import { HardHat, KeyRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import styles from '../login/login.module.css'

export default function ResetPasswordPage(){
  const [password,setPassword]=useState('')
  const [confirm,setConfirm]=useState('')
  const [message,setMessage]=useState('Opening your secure reset link...')
  const [busy,setBusy]=useState(false)
  const [ready,setReady]=useState(false)
  const supabase=createClient()

  useEffect(()=>{
    let mounted=true
    async function prepare(){
      const url=new URL(window.location.href)
      const code=url.searchParams.get('code')
      if(code){
        const {error}=await supabase.auth.exchangeCodeForSession(code)
        if(!mounted)return
        if(error){setMessage('This reset link is invalid or expired. Go back to Sign In and request a new password reset email.');return}
      }
      const {data}=await supabase.auth.getSession()
      if(!mounted)return
      if(data.session){setReady(true);setMessage('')}
      else setMessage('This reset link is invalid or expired. Go back to Sign In and request a new password reset email.')
    }
    prepare()
    return()=>{mounted=false}
  },[])

  async function submit(e:FormEvent){
    e.preventDefault()
    if(password.length<6){setMessage('Password must be at least 6 characters.');return}
    if(password!==confirm){setMessage('Passwords do not match.');return}
    setBusy(true);setMessage('')
    const {error}=await supabase.auth.updateUser({password})
    setBusy(false)
    if(error){setMessage(error.message);return}
    setMessage('Password updated. Taking you back to Sign In...')
    await supabase.auth.signOut()
    setTimeout(()=>{window.location.href='/login'},900)
  }

  return <main className={styles.page}><section className={styles.card}>
    <div className={styles.brand}><span className={styles.brandIcon}><HardHat/></span><div className={styles.brandText}><b>Construction</b><small>HQ</small></div></div>
    <h1>Reset your password</h1>
    <p className={styles.lead}>Choose a new password for your Construction HQ account.</p>
    {ready&&<form className={styles.form} onSubmit={submit}>
      <label>New password<input type="password" minLength={6} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="6+ characters"/></label>
      <label>Confirm password<input type="password" minLength={6} required value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repeat password"/></label>
      <button disabled={busy} className={styles.submit} type="submit"><KeyRound size={18}/>{busy?' Updating...':' Update Password'}</button>
    </form>}
    {message&&<div className={styles.message}>{message}</div>}
    {!ready&&<button className={styles.switch} onClick={()=>window.location.href='/login'}>Back to Sign In</button>}
  </section></main>
}
