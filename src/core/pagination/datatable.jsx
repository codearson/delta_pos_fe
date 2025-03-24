/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React,{useState} from "react";
import { Table } from "antd";
import { onShowSizeChange } from "./pagination";

const Datatable = ({ props, columns, dataSource }) => {
  
  return (
    <Table
      key={props}
      className="table datanew dataTable no-footer"
      columns={columns}
      dataSource={dataSource}

      rowKey={(record) => record.id}
    />
  );
};

export default Datatable;
