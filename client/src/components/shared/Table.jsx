import { Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function Table({ rows, columns, heading, rowHeight }) {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Typography
        textAlign={"center"}
        variant="h4"
        sx={{ margin: "2rem", textTransform: "uppercase" }}
      >
        {heading}
      </Typography>
      <DataGrid
        rows={rows}
        columns={columns}
        style={{ height: "80%" }}
        sx={{
          border: "none",
          color: "black",
          bgcolor: "#f9f9f9",
        }}
      />
    </div>
  );
}
