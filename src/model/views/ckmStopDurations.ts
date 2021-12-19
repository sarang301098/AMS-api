// import { ViewColumn, ViewEntity } from 'typeorm';

// @ViewEntity({
//   name: 'ckm_stop_durations_view',
//   expression: `
//   WITH inner_query AS (
//     SELECT ckms_status.ckm_id,
//        lag(ckms_status.value) OVER (PARTITION BY ckms_status.ckm_id ORDER BY ckms_status."timestamp") AS lag_value,
//        ckms_status.value,
//        lead(ckms_status.value) OVER (PARTITION BY ckms_status.ckm_id ORDER BY ckms_status."timestamp") AS lead_value,
//        ckms_status."timestamp",
//        lead(ckms_status."timestamp") OVER (PARTITION BY ckms_status.ckm_id ORDER BY ckms_status."timestamp") AS lead_timestamp
//       FROM ckms_status
//    ), middle_query AS (
//     SELECT inner_query.ckm_id,
//        inner_query."timestamp",
//        inner_query.lead_timestamp - inner_query."timestamp" AS value
//       FROM inner_query
//      WHERE inner_query.lag_value = 'running'::ckms_status_value_enum AND inner_query.value = 'stop'::ckms_status_value_enum AND inner_query.lead_value = 'running'::ckms_status_value_enum
//    )
// SELECT middle_query.ckm_id,
// middle_query."timestamp",
// date_part('epoch'::text, middle_query.value) / 60::double precision AS value
// FROM middle_query
// WHERE middle_query.value >= '00:00:15'::interval AND middle_query.value <= '02:00:00'::interval;
//   `,
// })
// export class CkmStopDurations {
//   @ViewColumn()
//   ckmId!: number;

//   @ViewColumn()
//   value!: number;

//   @ViewColumn()
//   timestamp!: Date;
// }
