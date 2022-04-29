$(() => {
  const $modal = $('.modal');
  const HIDE_CLASS = 'is-hide';

  $('#js-startbtn').on('click', () => {
    $modal.removeClass(HIDE_CLASS);
  });

  $('.js-modal-close').on('click', () => {
    $modal.addClass(HIDE_CLASS);
  });
});

$(document).ready(() => {
  const table = $('#example').DataTable({
    ajax: {
      url: 'http://localhost:3000/api/1.0/classes/types/1/routines', // 要抓哪個地方的資料
      type: 'GET', // 使用什麼方式抓
      dataType: 'json', // 回傳資料的類型
    },
    rowId(a) {
      return `class_routine_id_${a.id}`;
    },
    columns: [
      { data: 'class_type_id' },
      { data: 'weekday' },
      { data: 'start_time' },
      { data: 'end_time' },
      {
        data: 'delete_class_type',
        render(data, type, full, meta) {
          return "<input type='submit' value = '刪除資料'>";
        },
      },
    ],
  });
});

// $(document).ready(function() {
//   editor = new $.fn.dataTable.Editor( {
//       ajax: "/api/1.0/classes/types/1/routines",
//       table: "#example",
//       fields: [ {
//               label: "Class_type",
//               name: "class_type_id"
//           }, {
//               label: "星期",
//               name: "weekday"
//           }, {
//               label: "開始時間:",
//               name: "start_tmie"
//           }, {
//               label: "結束時間:",
//               name: "end_time"
//           }
//         ]
//     })
//   }

// let editor;
// $(document).ready(() => {
//   editor = new $.fn.dataTable.Editor({
//     ajax: '/api/1.0/classes/types/1/routines',
//     table: '#example',
//     fields: [{
//       label: 'Class_type',
//       name: 'class_type_id',
//     }, {
//       label: '星期',
//       name: 'weekday',
//     }, {
//       label: '開始時間:',
//       name: 'start_tmie',
//     }, {
//       label: '結束時間:',
//       name: 'end_time',
//     },
//     ],
//   });
// });

// // Activate an inline edit on click of a table cell
// $('#example').on('click', 'tbody td:not(:first-child)', function (e) {
//   editor.inline(this);
// });

// $('#example').DataTable({
//   dom: 'Bfrtip',
//   ajax: '/api/1.0/classes/types/1/routines',
//   order: [[1, 'asc']],
//   columns: [
//     {
//       data: null,
//       defaultContent: '',
//       className: 'select-checkbox',
//       orderable: false,
//     },
//     { data: 'class_type_id' },
//     { data: 'weekday' },
//     { data: 'start_time' },
//     { data: 'end_time' },
//   ],
//   select: {
//     style: 'os',
//     selector: 'td:first-child',
//   },
//   buttons: [
//     { extend: 'create', editor },
//     { extend: 'edit', editor },
//     { extend: 'remove', editor },
//   ],
// });
