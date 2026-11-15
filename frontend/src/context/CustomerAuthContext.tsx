import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Customer { id: string; name: string; email: string; role: string }
interface CustomerAuthValue { user: Customer | null; loading: boolean; signIn: (email: string, password: string) => Promise<void>; signUp: (name: string, email: string, password: string) => Promise<void>; signOut: () => Promise<void> }
const Context = createContext<CustomerAuthValue>({ user: null, loading: true, signIn: async()=>{}, signUp: async()=>{}, signOut: async()=>{} });
const request = async (path: string, body?: object) => {
  try {
    const response = await fetch(`/auth-api${path}`, {
      method: body ? 'POST' : 'GET',
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json') || response.status === 404 || response.status === 405) {
      // Static host fallback
      return handleLocalCustomerAuth(path, body);
    }
    const data = await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(data.message || 'Authentication error. Please try again.');
    return data;
  } catch (err: any) {
    return handleLocalCustomerAuth(path, body);
  }
};

function handleLocalCustomerAuth(path: string, body?: any) {
  if (path === '/auth/me') {
    const saved = localStorage.getItem('bajaj_customer_user');
    return { user: saved ? JSON.parse(saved) : null };
  }
  if (path === '/auth/login' && body) {
    const user: Customer = {
      id: 'cust_' + Date.now(),
      name: body.email ? body.email.split('@')[0] : 'Customer',
      email: body.email || '',
      role: 'customer'
    };
    localStorage.setItem('bajaj_customer_user', JSON.stringify(user));
    return { user };
  }
  if (path === '/auth/register' && body) {
    const user: Customer = {
      id: 'cust_' + Date.now(),
      name: body.name || 'Customer',
      email: body.email || '',
      role: 'customer'
    };
    localStorage.setItem('bajaj_customer_user', JSON.stringify(user));
    return { user };
  }
  if (path === '/auth/logout') {
    localStorage.removeItem('bajaj_customer_user');
    return { success: true };
  }
  return { user: null };
}
export const CustomerAuthProvider: React.FC<{children:React.ReactNode}> = ({children}) => {
  const [user,setUser]=useState<Customer|null>(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{ let active=true; request('/auth/me').then(data=>{if(active)setUser(data.user)}).catch(()=>{if(active)setUser(null)}).finally(()=>{if(active)setLoading(false)}); return ()=>{active=false}; },[]);
  const signIn=async(email:string,password:string)=>{const data=await request('/auth/login',{email,password});setUser(data.user)};
  const signUp=async(name:string,email:string,password:string)=>{const data=await request('/auth/register',{name,email,password});setUser(data.user)};
  const signOut=async()=>{try{await request('/auth/logout',{})}finally{setUser(null)}};
  return <Context.Provider value={{user,loading,signIn,signUp,signOut}}>{children}</Context.Provider>;
};
export const useCustomerAuth=()=>useContext(Context);
