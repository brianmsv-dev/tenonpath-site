// FAQ, word for word from docs/COPY.md > 09 FAQ. Used by the accordion and the FAQPage schema.
export const FAQ: { q: string; a: string }[] = [
  {
    q: 'Do you work with our property management software?',
    a: 'If it has an API or can export data, almost certainly yes. Tell us what you use on the discovery call and we will confirm before you pay anything.',
  },
  { q: 'Do we have to change our systems?', a: 'No. The point is to keep what you already pay for and connect it.' },
  { q: 'How long does a dashboard take?', a: 'Most take two to four weeks from signed scope to launch.' },
  {
    q: 'What does it cost?',
    a: 'Dashboards start at $2,500, automations at $750 and websites at $1,200. You get a fixed written quote before we start.',
  },
  {
    q: 'Where is our data stored, and is it secure?',
    a: 'On secure hosting under accounts you control where possible, behind a login. We use read-only access unless a workflow needs to write, and we never share your data.',
  },
  {
    q: "You're in Kenya. How does that work with US clients?",
    a: 'We work across US time zones with overlap in your morning, communicate by email and scheduled calls, and invoice in USD.',
  },
  {
    q: 'What happens after launch?',
    a: 'On a monthly plan we host, monitor and make small changes. Or we hand everything over and you run it yourselves.',
  },
];
