export const COLLECTION_CARD_FRAGMENT = `
  fragment CollectionCard on Collection {
    id
    handle
    title
    description
    image {
      url
      altText
    }
    goalBoxes: metafield(namespace: "beadoughs", key: "goal_boxes") {
      value
    }
    goalBoxesCustom: metafield(namespace: "custom", key: "goal_boxes") {
      value
    }
    boxesSold: metafield(namespace: "beadoughs", key: "boxes_sold") {
      value
    }
    boxesSoldCustom: metafield(namespace: "custom", key: "boxes_sold") {
      value
    }
    leaderboard: metafield(namespace: "beadoughs", key: "leaderboard") {
      value
    }
    leaderboardCustom: metafield(namespace: "custom", key: "leaderboard") {
      value
    }
    goalAmount: metafield(namespace: "beadoughs", key: "goal_amount") {
      value
    }
    raisedAmount: metafield(namespace: "beadoughs", key: "raised_amount") {
      value
    }
    endDate: metafield(namespace: "beadoughs", key: "end_date") {
      value
    }
    organization: metafield(namespace: "beadoughs", key: "organization") {
      value
    }
    supportersCount: metafield(namespace: "beadoughs", key: "supporters_count") {
      value
    }
  }
`

export const COLLECTION_BY_HANDLE_QUERY = `
  ${COLLECTION_CARD_FRAGMENT}
  query CollectionByHandle($handle: String!) {
    collection(handle: $handle) {
      ...CollectionCard
      descriptionHtml
      products(first: 24) {
        edges {
          node {
            id
            title
            handle
            description
            descriptionHtml
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

export const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      featuredImage {
        url
        altText
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 25) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
          }
        }
      }
      collections(first: 50) {
        edges {
          node {
            handle
          }
        }
      }
    }
  }
`

export const COLLECTION_CARD_ONLY_QUERY = `
  ${COLLECTION_CARD_FRAGMENT}
  query CollectionCardOnly($handle: String!) {
    collection(handle: $handle) {
      ...CollectionCard
    }
  }
`

/** Lists collections visible to the Storefront API (max $first). */
export const COLLECTIONS_FIRST_QUERY = `
  ${COLLECTION_CARD_FRAGMENT}
  query CollectionsFirst($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          ...CollectionCard
        }
      }
    }
  }
`

export const CART_QUERY = `
  query Cart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
      cost {
        totalAmount {
          amount
          currencyCode
        }
      }
      attributes {
        key
        value
      }
      lines(first: 50) {
        edges {
          node {
            id
            quantity
            cost {
              totalAmount {
                amount
                currencyCode
              }
            }
            attributes {
              key
              value
            }
            merchandise {
              ... on ProductVariant {
                id
                title
                product {
                  title
                  handle
                }
              }
            }
          }
        }
      }
    }
  }
`

export const CART_CREATE_MUTATION = `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const CART_ATTRIBUTES_UPDATE_MUTATION = `
  mutation CartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
    cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
      cart {
        id
        attributes {
          key
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
`
