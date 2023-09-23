import Link from "next/link";

const TicketList = ({ currentUser, tickets }) => {
  if (!tickets) {
    return <div>Loading...</div>;
  }

  const ticketList = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href={`/tickets/${ticket.id}`}>View</Link>
        </td>
      </tr>
    );
  });

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};

TicketList.getInitialProps = async (context, client) => {
  const { data } = await client.get("/api/tickets");

  return { tickets: data };
};

export default TicketList;
