import { Helmet } from "react-helmet-async";

const Title = ({ title = "Chat App", description = "Chat app" }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Helmet>
  );
};

export default Title;
