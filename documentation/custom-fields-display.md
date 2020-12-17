# Custom Fields Display

A custom configuration file can be provided to change the display of some data within the dashboard. The json should consist of rows formatted in the following way:

## Schema

| property  | type   | description                                                                |
| --------- | ------ | -------------------------------------------------------------------------- |
| tableId   | string | Apply rule to specific tableId. If omitted applies globally                |
| fieldName | string | Apply rule to specific field. If omitted applies globally                  |
| hidden    | string | The table or field should be hidden from displays (specify "TRUE")         |
| disabled  | string | The field should be disabled in all displays (specify "TRUE")              |
| order     | number | Priority given to the field in table display (where `1` will appear first) |

## Example

```
[
  {"tableId":"table_1","fieldName":"","hidden":"TRUE","disabled":""},
  {"tableId":"","fieldName":"_id","hidden":"","disabled":"","order":1},
  {"tableId":"","fieldName":"name","hidden":"","disabled":"","order":2},
  {"tableId":"table_2","fieldName":"name","hidden":"","disabled":"TRUE","order":""}
]
```

- Hide table id `table_1` in displays
- Make the column `_id` appear leftmost, followed by the `name` column
- Make the column `name` disabled (but still visisble) when displaying `table_2` (it will also keep order from the global setting)
