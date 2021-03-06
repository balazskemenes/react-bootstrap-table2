import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Const from '../const';
import {
  isAnySelectedRow,
  selectableKeys,
  unSelectableKeys,
  getSelectedRows
} from '../store/selection';
import { getRowByRowId } from '../store/rows';

export default Base =>
  class RowSelectionWrapper extends Component {
    static propTypes = {
      store: PropTypes.object.isRequired,
      selectRow: PropTypes.object.isRequired
    }

    constructor(props) {
      super(props);
      this.handleRowSelect = this.handleRowSelect.bind(this);
      this.handleAllRowsSelect = this.handleAllRowsSelect.bind(this);
      this.state = {
        selectedRowKeys: props.store.selected
      };
    }

    /**
     * row selection handler
     * @param {String} rowKey - row key of what was selected.
     * @param {Boolean} checked - next checked status of input button.
     */
    handleRowSelect(rowKey, checked, rowIndex) {
      const { selectRow: { mode, onSelect }, store } = this.props;
      const { ROW_SELECT_SINGLE } = Const;

      let currSelected = [...store.selected];

      if (mode === ROW_SELECT_SINGLE) { // when select mode is radio
        currSelected = [rowKey];
      } else if (checked) { // when select mode is checkbox
        currSelected.push(rowKey);
      } else {
        currSelected = currSelected.filter(value => value !== rowKey);
      }

      store.selected = currSelected;

      if (onSelect) {
        const row = getRowByRowId(store)(rowKey);
        onSelect(row, checked, rowIndex);
      }

      this.setState(() => ({
        selectedRowKeys: currSelected
      }));
    }

    /**
     * handle all rows selection on header cell by store.selected or given specific result.
     * @param {Boolean} option - customized result for all rows selection
     */
    handleAllRowsSelect(option) {
      const { store, selectRow: {
        onSelectAll,
        nonSelectable
      } } = this.props;
      const selected = isAnySelectedRow(store)(nonSelectable);

      // set next status of all row selected by store.selected or customizing by user.
      const result = option || !selected;

      const currSelected = result ?
        selectableKeys(store)(nonSelectable) :
        unSelectableKeys(store)(nonSelectable);


      store.selected = currSelected;

      if (onSelectAll) {
        onSelectAll(result, getSelectedRows(store));
      }

      this.setState(() => ({
        selectedRowKeys: currSelected
      }));
    }

    render() {
      return (
        <Base
          { ...this.props }
          onRowSelect={ this.handleRowSelect }
          onAllRowsSelect={ this.handleAllRowsSelect }
        />
      );
    }
  };
