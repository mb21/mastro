import { CounterClient } from "../routes/components/Counter.client.jsx";

export const Counter = () =>
  init(CounterClient, { initialCount: 0 }, client =>
    <div>
      long server text
      {client.count.get()}
      <button onClick={client.inc}>+</button>
    </div>
  )

const init = (comp, initialProps, cb) => {
  const client = comp()
  const server = cb(client)
  console.log(server)

  const eventListeners = []
  traverse(server, node => {
    if (node.props.onClick) {
      const fnName = extractFnName(node.props.onClick.toString())
      const id = '123'
      node.props.id = id
      eventListeners.push(`getEl(${id}).addEventListener('click', ${fnName})`)
    }
  })
  return (
    <>
      <script type='module'>
        import { CounterClient } from '{client.path}'

        const initialProps = {JSON.stringify(initialProps)};

        CounterClient(initialProps)
      </script>,
      {server}
    </>
  )
}

const traverse = (jsx, cb) => {
  // TODO: implement recursively
  return jsx.props.children.forEach(cb)
}
