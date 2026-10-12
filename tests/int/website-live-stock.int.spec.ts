import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
const mocks = vi.hoisted(() => ({ read:vi.fn(), merge:vi.fn(async (cars)=>cars), payload:vi.fn(async()=>new Map()), overrides:vi.fn(async()=>new Map()) }))
vi.mock('@/lib/services/dmsWebsiteStock',()=>({getDmsWebsiteVehicles:mocks.read}))
vi.mock('@/utilities/mergePayloadData',()=>({mergeVehiclesWithPayloadData:mocks.merge,fetchPayloadVehicleData:mocks.payload,mergeVehicleWithPayloadData:(v:unknown)=>v,preferDmsAdvertCopy:(_v:unknown,m:unknown)=>m}))
vi.mock('@/utilities/vehicleOverrides',()=>({fetchOverridesMap:mocks.overrides,applyOverrideToVehicle:(v:unknown)=>v}))
import { GET as listings } from '@/app/api/listings/route'
import { GET as detail } from '@/app/api/listing/[stockId]/route'
import { GET as featured } from '@/app/api/featured-vehicles/route'
const car=(id:string,state:string)=>({vehicle:{make:'BMW',model:'320d',standard:{},yearOfManufacture:2020},metadata:{stockId:id,lifecycleState:state},reserved:state==='SALE_IN_PROGRESS',adverts:{forecourtPrice:{amountGBP:16995},retailAdverts:{attentionGrabber:'£12k in mods',advertiserAdvert:{status:'PUBLISHED'}}},media:{images:[{href:'https://cdn.example/kept.jpg'}]}})
beforeEach(()=>{vi.clearAllMocks();mocks.read.mockImplementation(async kind=>kind==='sold'?[car('sold','SOLD')]:[car('reserved','SALE_IN_PROGRESS')])})
describe('website listing, detail and homepage use DMS eligibility',()=>{
 it('retains reserved listings, their tag input, price and attention grabber',async()=>{
  const response=await listings(new NextRequest('http://localhost/api/listings'))
  const data=await response.json()
  expect(response.status).toBe(200)
  expect(data.results[0]).toMatchObject({reserved:true,metadata:{lifecycleState:'SALE_IN_PROGRESS'},adverts:{retailAdverts:{attentionGrabber:'£12k in mods'}}})
  expect(data.totalResults).toBe(1)
  expect(mocks.read).toHaveBeenCalledWith('live')
 })
 it('serves a reserved detail with similar live products',async()=>{
  const response=await detail(new NextRequest('http://localhost/api/listing/reserved'),{params:Promise.resolve({stockId:'reserved'})})
  expect((await response.json()).vehicle.reserved).toBe(true)
  expect(mocks.read).toHaveBeenCalledWith('live')
 })
 it('looks up sold detail exclusively in the selected DMS sold feed, without legacy overrides',async()=>{
  const response=await detail(new NextRequest('http://localhost/api/listing/sold'),{params:Promise.resolve({stockId:'sold'})})
  expect((await response.json()).vehicle.metadata.lifecycleState).toBe('SOLD')
  expect(mocks.read).toHaveBeenCalledWith('sold')
  expect(mocks.payload).not.toHaveBeenCalled()
  expect(mocks.overrides).not.toHaveBeenCalled()
 })
 it('does not resurrect an unticked sold car via Payload or the archive',async()=>{
  const response=await detail(new NextRequest('http://localhost/api/listing/unticked'),{params:Promise.resolve({stockId:'unticked'})})
  expect(response.status).toBe(404)
 })
 it('homepage features share the live feed and never use the ordinary all-status feed',async()=>{
  const response=await featured()
  expect((await response.json()).results[0].reserved).toBe(true)
  expect(mocks.read).toHaveBeenCalledWith('live')
 })
})
