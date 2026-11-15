import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Customer { id: string; name: string; email: string; role: string }
interface CustomerAuthValue { user: Customer | null; loading: boolean; signIn: (email: string, password: string) => Promise<void>; signUp: (name: string, email: string, password: string) => Promise<void>; signOut: () => Promise<void> }
const Context = createContext<CustomerAuthValue>({ user: null, loading: true, signIn: async()=>{}, signUp: async()=>{}, signOut: async()=>{} });
const request = async (path: string, body?: object) => {
  const response = await fetch(`/auth-api${path}`, { method: body ? 'POST' : 'GET', credentials: 'include', headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
  const data = await response.json().catch(()=>({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong. Please try again.');
  return data;
};
export const CustomerAuthProvider: React.FC<{children:React.ReactNode}> = ({children}) => {
  const [user,setUser]=useState<Customer|null>(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{ let active=true; request('/auth/me').then(data=>{if(active)setUser(data.user)}).catch(()=>{if(active)setUser(null)}).finally(()=>{if(active)setLoading(false)}); return ()=>{active=false}; },[]);
  const signIn=async(email:string,password:string)=>{const data=await request('/auth/login',{email,password});setUser(data.user)};
  const signUp=async(name:string,email:string,password:string)=>{const data=await request('/auth/register',{name,email,password});setUser(data.user)};
  const signOut=async()=>{try{await request('/auth/logout',{})}finally{setUser(null)}};
  return <Context.Provider value={{user,loading,signIn,signUp,signOut}}>{children}</Context.Provider>;
};
export const useCustomerAuth=()=>useContext(Context);
