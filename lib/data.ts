export interface Fundraiser {
  id: string
  slug: string
  title: string
  organization: string
  description: string
  goalAmount: number
  raisedAmount: number
  daysLeft: number
  supporters: number
  image: string
}

export const FUNDRAISERS: Fundraiser[] = [
  {
    id: "1",
    slug: "hobart-primary-playground",
    title: "New Playground Equipment for Hobart Primary",
    organization: "Hobart Primary P&C",
    description: "We are raising funds to replace our 15-year-old playground equipment. The new structure will be fully inclusive and accessible to all students. Buy a box of delicious Beadoughs doughnuts today to support our kids! Every single box sold gets us closer to our goal.",
    goalAmount: 5000,
    raisedAmount: 3250,
    daysLeft: 12,
    supporters: 145,
    image: "/images/hero_doughnuts_1777851722550.png"
  },
  {
    id: "2",
    slug: "launceston-football-club",
    title: "End of Season Trip & New Jerseys",
    organization: "Launceston Football Club U18s",
    description: "Support the boys on their end of season trip! We're selling fresh, locally-made Beadoughs to help cover the costs of travel and brand new away jerseys for the upcoming finals.",
    goalAmount: 2500,
    raisedAmount: 850,
    daysLeft: 5,
    supporters: 42,
    image: "/images/chocolate_doughnut_1777852073378.png"
  },
  {
    id: "3",
    slug: "tas-animal-rescue",
    title: "Winter Blankets & Medical Supplies",
    organization: "Tasmanian Animal Rescue",
    description: "Winter is coming, and our shelter is at full capacity. We are running this doughnut drive to raise emergency funds for heated blankets and critical medical supplies for the abandoned animals in our care.",
    goalAmount: 4000,
    raisedAmount: 3900,
    daysLeft: 2,
    supporters: 310,
    image: "/images/glazed_doughnut_1777852019288.png"
  }
]
