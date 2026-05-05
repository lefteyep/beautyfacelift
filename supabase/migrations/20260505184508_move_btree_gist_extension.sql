-- Keep extension-owned objects out of the exposed public API schema.

CREATE SCHEMA IF NOT EXISTS extensions;

ALTER EXTENSION btree_gist SET SCHEMA extensions;
