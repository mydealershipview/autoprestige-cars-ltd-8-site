/** Autoprestige customer testimonials: the one list used by the Testimonials page and the
 * homepage reviews section (upgrade spec: reviews on the homepage, 20/11/2026). */
export type Testimonial = { name: string; text: string; rating: number }

export const GOOGLE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJJ9M8hrzme0gRJmPMgCLO__Y'

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Mark R',
    text: 'Very good experience, easy and relaxed process from initial enquiries to vehicle collection. Thank you to the team.',
    rating: 5,
  },
  {
    name: 'Ben H',
    text: 'Very helpful and friendly staff. Very clean and tidy showroom with some amazing cars for sale and not badly priced.',
    rating: 5,
  },
  {
    name: 'Waquas A',
    text: "I would like to thank the team for the service provided when purchasing my new vehicle. I highly recommend and will most definitely be returning for my next vehicle. Thanks guys!",
    rating: 5,
  },
  {
    name: 'Frankie',
    text: "Brilliant customer service today, came in looking for a C63 and had a nice friendly chat, can't wait to pick it up tomorrow thanks guys :)",
    rating: 5,
  },
  {
    name: 'Paul G',
    text: "Top class service from the second I walked in, bought a 1 year old RS3 at a very competitive price. The showroom is incredible! Highly recommend these lads.",
    rating: 5,
  },
  {
    name: 'Damien J',
    text: 'Top service, top company and top choice of vehicles. Always purchase my cars here. I will highly recommend this company.',
    rating: 5,
  },
  {
    name: 'Tom R',
    text: 'Highly professional, courteous and easy to deal with. Sold a car to them and got a great price.',
    rating: 5,
  },
  {
    name: 'Abdi',
    text: "Fantastic service, genuinely unbeatable! The nicest car dealers I have ever met. Will be coming here again soon for a new present.",
    rating: 5,
  },
  {
    name: 'Christian C',
    text: 'Great service from staff, got a brand new car with a decent deal.',
    rating: 5,
  },
  {
    name: 'Sarah M',
    text: 'Absolutely fantastic from start to finish. Nothing was too much trouble and the whole experience was seamless. Would 100% recommend.',
    rating: 5,
  },
  {
    name: 'James K',
    text: 'Excellent selection of vehicles and knowledgeable staff. The whole buying process was transparent and stress-free. Very happy with my purchase.',
    rating: 5,
  },
  {
    name: 'Lisa T',
    text: 'Genuinely impressed by the level of service. The team went above and beyond to help me find the right car within my budget. Could not ask for more.',
    rating: 5,
  },
]
