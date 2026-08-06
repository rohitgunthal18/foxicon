-- Default agreement boilerplate, in FOXI TECH's voice.
--
-- Every field here is editable at generation time; the admin overrides only
-- what this particular client needs. Deliberately single-paragraph blocks so
-- the printed agreement stays short and readable.
--
-- Idempotent: safe to re-run; only inserts when no default exists yet.

insert into public.agreement_templates (
  name, is_default,
  intro, scope, payment_terms, delivery, support, revisions,
  client_duties, ownership, confidentiality, liability, termination, dispute,
  signing_text
)
select
  'FOXI TECH Standard',
  true,
  'This Agreement is made between FOXI TECH ("we", "us"), based at Shop 4, Tech Plaza, Baner Road, Pune, Maharashtra 411045, and the client named below ("you"). It covers the digital services described in the Scope of Work. By signing, you accept the terms on this page.',
  'We will design, build and deliver the website and digital services set out in the line items above, in line with the project plan shared after this agreement is signed.',
  'Payment is to be made as per the schedule outlined in the Installments section. The advance payment is non-refundable once project work commences. The remaining payment is due upon delivery of the completed project as per agreed specifications. All payments must be made via bank transfer or UPI.',
  'The project will be delivered within the Delivery Days shown above from the date the advance is received and all required content is supplied by you. Any delay in content, decisions or payments extends the delivery date by the same period.',
  'Post-delivery support is provided for the Support Months shown above at no additional cost. This includes bug fixes and minor updates. Major feature additions or redesigns will be quoted separately.',
  'The number of revision rounds included is shown in the Revisions Included line above. Further rounds, and any changes that alter the scope, are billed at our standard hourly rate.',
  'You will provide all text, images, logos and business details needed for the project, on time and in final form. You confirm you own or hold the rights to all material you supply. Delay in supplying this material extends the delivery date.',
  'Upon full payment, all intellectual property rights for the delivered project are transferred to you. We retain the right to showcase the work in portfolios and case studies unless explicitly prohibited by you in writing.',
  'We will not disclose your business information, customer data or project details to any third party, except as needed to deliver the services. This obligation survives the end of this agreement.',
  'We deliver the work to the agreed scope and fix genuine defects. Refunds will not be provided once the service has been delivered and accepted by you. If the project is cancelled before commencement, a full refund of the advance payment will be issued. No refunds will be issued after work has begun. One (1) year of complimentary hosting and domain registration is included with this agreement. Renewal charges apply after the first year. FOXI TECH is not responsible for any misuse, abuse, or violations of third-party terms by you in relation to the hosting service or domain. To the fullest extent permitted by law, our total liability under this agreement is limited to the amount you have paid us, and we are not liable for lost profits, indirect damages, or any legal issues arising from your use or misuse of the delivered service, domain, or hosting. You agree to use the delivered assets in compliance with all applicable laws and regulations.',
  'Either party may end this agreement with 7 days written notice. If you cancel after work has started, you pay for the work completed to date. If we cancel, we refund the unused portion of the advance.',
  'This agreement is governed by the laws of India. Disputes will first be discussed in good faith, and if unresolved, referred to the courts of Pune, Maharashtra.',
  'I confirm I have read and agree to the terms above, and that the details I have provided are accurate. This typed name serves as my legal signature.'
from (select 1) as x
where not exists (
  select 1 from public.agreement_templates where is_default
);
