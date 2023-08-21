# Gife-Mailchimp Intergration

## Background, context, and business value

Gife, Group of Institutes, Foundations and Companies, is a Brazilian non-profit
organization that works to strengthen private social investment and
philanthropy.

Gife uses Salesforce as its CRM system to manage its associate base and
Mailchimp as its email marketing platform. Currently they have Mailchimp for
Salesforce app installed in its org, with the objective of syncing SF Campaign
Members to Mailchimp Contacts. However, the app has not been reliable in
updating Mailchimp tags (SF Campaigns), which are used to segment audiences.

Gife has engaged Vera Solutions and OpenFn to develop a one-way integration
between Salesforce and Mailchimp so that Gife has an up-to-date base from which
to send email communication.

- Campaign: SF object that holds groups and events records.
- Campaign Member: SF object that holds records of contacts that are associated
  with a Campaign.
- Deleted Campaign Member: SF object that holds records of contacts that are
  associated with a Campaign.
- List: group of contacts in Mailchimp. Gife only has 1 list in the platform, so
  the id is fixed for all operations. List member: a contact in Mailchimp.
- Tag: Mailchimp labels that are used to segment contacts. Tags represent SF
  Campaigns in Mailchimp.

_Note that commits to `main` will be auto-deployed to OpenFn.org. Always work on
a branch!_

## Getting started with the Repo

1. create `/tmp` folder locally with a `state.json` file that you don't commit
   to github
2. start writing and testing jobs locally with the relevant adaptor

## Implementation Checklist

[See this workbook](https://docs.google.com/spreadsheets/d/1_XY0nx0OLNUsogrIHnRaSTyZ-KdcSXks-tqwm3ZfMc4/edit#gid=72612093)
for a template work plan for the OpenFn implementation, or contact
support@openfn.org to get the Asana-version of this checklist.

## Administration

### Provisioning, Hosting, & Maintenance

- Deployment: SaaS or Local?
- Platform Version: OpenFn V1
- Maintenance: Team responsible for software maintenance, security updates,
  etc. - confirm roles & responsibilities across systems

### Support

_List relevant support point of contacts and system administrators._

- {Contact1}
