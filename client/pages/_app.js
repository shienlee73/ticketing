import "../node_modules/bootstrap/dist/css/bootstrap.css";
import buildClient from "../api/buildClient";
import Header from "../components/Header";

const App = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
};

App.getInitialProps = async (context) => {
  const client = buildClient(context.ctx);
  const {
    data: { currentUser },
  } = await client.get("/api/users/currentUser");

  let pageProps = {};
  if (context.Component.getInitialProps) {
    pageProps = await context.Component.getInitialProps(
      context.ctx,
      client,
      currentUser
    );
  }

  return { pageProps, currentUser };
};

export default App;
