import React from 'react'
export function FormHoneypot() {
  return <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
    <label>Leave this field empty<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
  </div>
}
export function honeypotValue(form: EventTarget & Element) {
  return new FormData(form as HTMLFormElement).get('website') || ''
}
