# Administration and user workflows

Engineering procedure; product details come from [version-matched sources](../source-policy.md).

Start with the business outcome, affected module and role. Use supported configuration before custom code. A simple report or campaign question needs the relevant release and UI evidence, not database credentials or a full server inventory.

- **Users and access:** establish record ownership, roles and Security Groups in the actual deployment. Compare an affected account with a permitted control account; do not test solely as admin. Verify both allowed and denied operations.
- **Fields, layouts and relationships:** locate the supported administration surface for the release. Check UI and API representation, existing data, required fields and affected integrations. Use metadata/configuration where sufficient; route enforcement to the actual backend path.
- **Reports, Dashlets and Templates:** clarify selection, grouping, aggregation, visibility and expected output. Check sample results and role access. Avoid asserting availability of a reporting feature based on its name alone.
- **Campaigns and Email:** clarify audience/consent, suppression, sender, template and delivery mechanism. Prepare and preview first. A request to configure a campaign does not authorize sending messages. Validate with an approved test recipient only when authorized.
- **Workflows/Process Automation:** inspect trigger, conditions, repeated execution and side effects. Use a non-production sample and verify that a repeated save does not send duplicate notifications or create duplicate records.

Give exact menu names only when release-matched documentation or observed UI supports them. If 8.x delegates administration to legacy, state the evidence instead of combining two navigation guides. Explain configuration results in the user's language, keeping actual identifiers unchanged.
