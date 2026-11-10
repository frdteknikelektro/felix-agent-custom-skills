# Authenticate a new thread

Run the current event's status before JALA work. A new thread requires its own
upload, even for an existing contact. In the widget, the upload is automatic;
wait for it rather than asking the person to paste credentials.

Read [authentication](../authentication.md), then run authenticate using the
current event's exact attachment path. The helper validates profile/contact
identity and retains accepted bytes in the session. Return the safe result;
for the widget's internal auth message, use its required jali-auth result tag.

Completion: this thread has a verified active file, or the helper's safe failure
is reported. A successful initialization turn alone is not authentication.
