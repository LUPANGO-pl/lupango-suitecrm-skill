> **Non-official engineering playbook:** Use [version-matched sources](../source-policy.md) for product evidence.

# Testing And Verification

1. Define a concrete success criterion. For a behavioral code change, use the smallest meaningful regression test and observe the expected failure when feasible. For simple reversible configuration or text changes, use direct verification rather than adding a test that mirrors implementation.
2. Implement the smallest documented extension or configuration change that can satisfy the criterion.
3. Verify activation explicitly as applicable: extension registration, Symfony and retained legacy cache effects, metadata repair, Angular build output, asset publication, worker reload, or service restart.
4. Test administrator and least-privileged roles, including negative authorization cases. Cover create and edit paths separately when both can write.
5. Test API V8 against the deployed route and metadata: authentication, authorization, invalid input, response contract, and side effects.
6. Test UI behavior across relevant save branches, navigation without reload, browser network/console state, translations, and stale assets.
7. Correlate application, runtime, web, worker, queue, and browser evidence by identifier and time without exposing sensitive values.
8. After focused checks pass, broaden only to affected modules, write paths, integrations, jobs, data invariants and adjacent roles with unresolved risk. Do not repeatedly run unrelated checks after sufficient validation.
9. Record exact release, paths, checksums, commands, results, and untested assumptions. Absence of a visible error is not proof of success.
10. Verify the disable or removal rollback and repeat the focused test after restoration when the change is risky.
