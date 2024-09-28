import { CommandParamType, Consy, ParameterizableCommand } from 'consy';

const rawTableBody: HTMLTableSectionElement | null = document.querySelector('tbody');

interface AddRowsParams {
  rowsCount: number;
  firstIncomingRowIndex: number;
  tableBody: HTMLTableSectionElement;
}
function addRows({ rowsCount, firstIncomingRowIndex, tableBody }: AddRowsParams): void {
  if (rowsCount <= 0 || !Number.isInteger(rowsCount)) {
    throw new Error('The rows count must be a greater than zero integer.');
  }

  if (firstIncomingRowIndex < 0 || !Number.isInteger(firstIncomingRowIndex)) {
    throw new Error('The first incoming row index must be a positive integer.');
  }

  if (rowsCount > 1000) {
    console.warn(
      'The rows count is greater than 1000. This may cause performance issues. If you are facing page freezing, consider reducing the rows count.'
    );
  }

  const colorSource: number = Math.abs(new Date().valueOf()) % Math.pow(2, 24);
  const colorHex: string = `#${colorSource.toString(16).padStart(6, '0')}`;

  let createdRowsCount: number = 0;
  while (createdRowsCount < rowsCount) {
    const rowElement: HTMLTableRowElement = document.createElement('tr');

    const indexCell: HTMLTableCellElement = document.createElement('td');
    indexCell.textContent = String(firstIncomingRowIndex + createdRowsCount + 1);
    rowElement.appendChild(indexCell);

    const createdDateCell: HTMLTableCellElement = document.createElement('td');
    rowElement.appendChild(createdDateCell);

    const createdDateWithGroupMarkContainer: HTMLElement = document.createElement('section');
    createdDateWithGroupMarkContainer.style.borderRightColor = colorHex;
    createdDateWithGroupMarkContainer.className = 'p-2 border-r-8 contrast-[95%]';
    createdDateWithGroupMarkContainer.textContent = new Date().toISOString();
    createdDateCell.appendChild(createdDateWithGroupMarkContainer);

    tableBody.appendChild(rowElement);
    createdRowsCount++;
  }
}

new Consy('consy')
  .addCommand({
    name: 'clearTable',
    description: 'Clears the table.',
    callback: () => {
      if (rawTableBody === null) {
        throw new Error('The table body element is missing.');
      }

      rawTableBody.innerHTML = '';
    }
  })
  .addCommand({
    name: 'addRows',
    description: 'Adds rows to the table.',
    params: {
      count: {
        type: CommandParamType.String
      }
    },
    callback: (({ count }: { count: string }) => {
      const rowsCount: number = Number(count);
      if (Number.isNaN(rowsCount)) {
        throw new Error('The count parameter is not a number.');
      }

      if (rawTableBody === null) {
        throw new Error('The table body element is missing.');
      }

      const firstIncomingRowIndex: number = rawTableBody.rows.length ?? 0;
      addRows({ rowsCount, firstIncomingRowIndex, tableBody: rawTableBody });
    }) as any
  } satisfies ParameterizableCommand<{
    count: {
      type: CommandParamType.String;
    };
  }>)

  .mount();
