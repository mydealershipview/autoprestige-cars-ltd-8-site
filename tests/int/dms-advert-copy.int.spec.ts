import { describe, expect, it, vi } from 'vitest'
vi.mock('payload',()=>({getPayload:async()=>({find:async()=>({docs:[]})})}))
vi.mock('@payload-config',()=>({default:Promise.resolve({})}))
vi.mock('@/utilities/vehicleOverrides',()=>({applyVehicleOverrides:async(cars:AutoTraderVehicle[])=>cars.map((car)=>({
  ...car,adverts:{...car.adverts,forecourtPrice:{amountGBP:17995},retailAdverts:{...car.adverts.retailAdverts,attentionGrabber:'Old website edit',reservationStatus:'Available'}},
}))}))
import { mergeVehiclesWithPayloadData } from '@/utilities/mergePayloadData'
import type { AutoTraderVehicle } from '@/utilities/autotrader'
const car=(text:string)=>({vehicle:{make:'BMW'},metadata:{stockId:'demo'},adverts:{reservationStatus:'Reserved',forecourtPrice:{amountGBP:16995},retailAdverts:{attentionGrabber:text,reservationStatus:'Reserved'}}}) as AutoTraderVehicle

describe('DMS-owned website advert copy',()=>{
 it('a new DMS highlight and reservation replace old website overrides while preserving other customizations',async()=>{
  const [result]=await mergeVehiclesWithPayloadData([car('£12k in mods / Stage 2')])
  expect(result.adverts.retailAdverts.attentionGrabber).toBe('£12k in mods / Stage 2')
  expect(result.adverts.reservationStatus).toBe('Reserved')
  expect(result.adverts.retailAdverts.reservationStatus).toBe('Reserved')
  expect(result.adverts.forecourtPrice.amountGBP).toBe(17995)
 })
 it('clearing the DMS highlight does not resurrect an old override',async()=>{
  const [result]=await mergeVehiclesWithPayloadData([car('')])
  expect(result.adverts.retailAdverts.attentionGrabber).toBe('')
 })
})
